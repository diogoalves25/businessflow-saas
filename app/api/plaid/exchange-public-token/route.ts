import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { plaidClient } from '@/lib/plaid';
import { encrypt } from '@/lib/encryption';
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

    const { public_token, account_ids } = await request.json();

    if (!public_token || !account_ids) {
      return NextResponse.json(
        { error: 'Public token and account IDs are required' },
        { status: 400 }
      );
    }

    // Get user's organization
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

    // Mock implementation - in production would exchange with Plaid
    const accessToken = 'access-sandbox-' + Date.now();
    const encryptedToken = encrypt(accessToken);

    // Save connection to database
    const connection = await prisma.plaidConnection.create({
      data: {
        organizationId: dbUser.organization.id,
        institutionName: 'Sample Bank',
        accessToken: encryptedToken,
        itemId: 'item_' + Date.now(),
        accountName: 'Business Checking',
        accountMask: '1234',
        accountType: 'checking',
        isActive: true,
      },
    });

    // Log the action
    await createAuditLog({
      organizationId: dbUser.organization.id,
      userId: user.id,
      action: 'BANK_ACCOUNT_CONNECTED',
      entityId: connection.id,
      entityType: 'PlaidConnection',
      metadata: {
        institutionName: 'Sample Bank',
        accountCount: account_ids.length,
      },
    });

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
    });
  } catch (error) {
    console.error('Exchange public token error:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}
