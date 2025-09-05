import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { getPayrollHistory } from '@/lib/payroll';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and check Premium access
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization || dbUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(dbUser.organization.stripePriceId || null, 'hasPayroll')) {
      return NextResponse.json(
        { error: 'Payroll automation requires Premium plan' },
        { status: 403 }
      );
    }

    // Get payroll history
    const history = await getPayrollHistory(dbUser.organization.id);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Fetch payroll history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll history' },
      { status: 500 }
    );
  }
}