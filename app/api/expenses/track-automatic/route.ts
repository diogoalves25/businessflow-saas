import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutomaticExpenseTracker } from '@/lib/services/automatic-expense-tracking';
import { canAccessFeature } from '@/lib/feature-gating';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this premium feature
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { stripePriceId: true }
    });

    if (!canAccessFeature(organization?.stripePriceId || null, 'hasAdvancedAnalytics')) {
      return NextResponse.json({ 
        error: 'This feature requires a premium subscription' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { month } = body;

    const tracker = new AutomaticExpenseTracker({
      organizationId: session.user.organizationId,
      month: month ? new Date(month) : new Date()
    });

    const results = await tracker.trackAllExpenses();

    // Also track Stripe fees
    const stripeFeeResult = await tracker.trackStripeFees();
    
    const totalTracked = results.details
      .filter((r: any) => r.status === 'fulfilled')
      .reduce((sum: number, r: any) => sum + r.value.count, 0) + stripeFeeResult.count;

    return NextResponse.json({
      success: true,
      message: `Tracked ${totalTracked} new expenses`,
      details: [
        ...results.details.map((r: any) => r.status === 'fulfilled' ? r.value : r.reason),
        stripeFeeResult
      ]
    });
  } catch (error) {
    console.error('Error tracking automatic expenses:', error);
    return NextResponse.json({ 
      error: 'Failed to track automatic expenses' 
    }, { status: 500 });
  }
}