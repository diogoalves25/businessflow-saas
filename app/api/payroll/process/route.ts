import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { createPayrollRun } from '@/lib/payroll';
import { plaidClient } from '@/lib/plaid';
import { decrypt } from '@/lib/encryption';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
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

    const { accountId, periodStart, periodEnd, calculations } = await request.json();

    if (!accountId || !periodStart || !periodEnd || !calculations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse account ID (format: connectionId:accountId)
    const [connectionId, plaidAccountId] = accountId.split(':');

    // Get Plaid connection
    const connection = await prisma.plaidConnection.findFirst({
      where: {
        id: connectionId,
        organizationId: dbUser.organization.id,
        isActive: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Create payroll run in database
    const payrollRunId = await createPayrollRun(
      dbUser.organization.id,
      new Date(periodStart),
      new Date(periodEnd),
      calculations
    );

    // In production, you would:
    // 1. Create ACH transfers using Plaid's processor token
    // 2. Track transfer status
    // 3. Handle webhooks for transfer updates
    // 4. Update payroll run status

    // For demo, we'll just mark it as completed
    await prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: { 
        status: 'completed',
        processedAt: new Date(),
      },
    });

    // Log the action with audit trail
    await createAuditLog({
      organizationId: dbUser.organization.id,
      userId: user.id,
      action: 'PAYROLL_PROCESSED',
      entityId: payrollRunId,
      entityType: 'PayrollRun',
      metadata: {
        totalAmount: calculations.reduce((sum: number, calc: any) => sum + calc.netAmount, 0),
        employeeCount: calculations.length,
        accountUsed: accountId,
        periodStart,
        periodEnd,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      payrollRunId,
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}