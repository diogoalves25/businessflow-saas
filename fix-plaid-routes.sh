#!/bin/bash

# Fix create-link-token route
cat > app/api/plaid/create-link-token/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { plaidClient } from '@/lib/plaid';
import { canAccessFeature } from '@/src/lib/feature-gating';

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

    // Create a link token for the user
    const linkTokenResponse = await plaidClient.createLinkToken({
      user: user.id,
      clientName: dbUser.organization.businessName,
    });

    return NextResponse.json({
      link_token: linkTokenResponse.link_token
    });
  } catch (error) {
    console.error('Create link token error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
EOF

# Fix exchange-public-token route
cat > app/api/plaid/exchange-public-token/route.ts << 'EOF'
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
        institutionId: 'ins_1',
        accessToken: encryptedToken,
        itemId: 'item_' + Date.now(),
        accountIds: account_ids,
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
EOF

echo "Plaid routes fixed!"