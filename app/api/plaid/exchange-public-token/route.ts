import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { plaidClient } from '@/src/lib/plaid';
import { encrypt } from '@/src/lib/encryption';

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

    const { public_token, institution, accounts } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const membership = await prisma.userOrganization.findFirst({
      where: { 
        userId: user.id,
        user: { role: 'admin' }
      },
      include: { organization: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Store the primary checking account
    const primaryAccount = accountsResponse.data.accounts.find(
      account => account.type === 'depository' && account.subtype === 'checking'
    ) || accountsResponse.data.accounts[0];

    // Check if connection already exists
    const existingConnection = await prisma.plaidConnection.findFirst({
      where: {
        organizationId: membership.organization.id,
        itemId,
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.plaidConnection.update({
        where: { id: existingConnection.id },
        data: {
          accessToken: encrypt(accessToken),
          isActive: true,
        },
      });
    } else {
      // Create new connection
      await prisma.plaidConnection.create({
        data: {
          organizationId: membership.organization.id,
          accessToken: encrypt(accessToken),
          itemId,
          institutionName: institution?.name || 'Unknown Institution',
          accountName: primaryAccount.name,
          accountMask: primaryAccount.mask || '',
          accountType: primaryAccount.type,
        },
      });
    }

    return NextResponse.json({
      success: true,
      institution: institution?.name,
      account: {
        name: primaryAccount.name,
        mask: primaryAccount.mask,
        type: primaryAccount.type,
      },
    });
  } catch (error) {
    console.error('Exchange public token error:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}