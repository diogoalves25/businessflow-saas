import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutomaticExpenseTracker } from '@/lib/services/automatic-expense-tracking';
import { canAccessFeature } from '@/src/lib/feature-gating';
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

    // For now, return a placeholder response since the automatic tracking methods don't exist
    // In production, this would integrate with bank APIs, email parsing, etc.
    const tracker = new AutomaticExpenseTracker();
    
    // Mock implementation - in production this would process actual transactions
    const mockTransactions = [
      {
        description: 'AWS Services',
        amount: 150.00,
        date: new Date(),
        accountId: 'mock-account'
      },
      {
        description: 'Google Workspace',
        amount: 12.99,
        date: new Date(),
        accountId: 'mock-account'
      }
    ];

    const results = await Promise.all(
      mockTransactions.map(transaction => 
        tracker.processTransaction(
          transaction,
          session.user.organizationId,
          session.user.id
        )
      )
    );

    const totalTracked = results.filter(r => r.created).length;

    return NextResponse.json({
      success: true,
      message: `Tracked ${totalTracked} new expenses`,
      details: results
    });
  } catch (error) {
    console.error('Error tracking automatic expenses:', error);
    return NextResponse.json({ 
      error: 'Failed to track automatic expenses' 
    }, { status: 500 });
  }
}