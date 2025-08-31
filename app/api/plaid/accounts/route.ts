import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { plaidClient } from '@/src/lib/plaid';
import { decrypt } from '@/src/lib/encryption';

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

    // Get all active Plaid connections
    const connections = await prisma.plaidConnection.findMany({
      where: {
        organizationId: membership.organization.id,
        isActive: true,
      },
    });

    // Fetch account details for each connection
    const accountsPromises = connections.map(async (connection) => {
      try {
        const accessToken = decrypt(connection.accessToken);
        const accountsResponse = await plaidClient.accountsGet({
          access_token: accessToken,
        });

        // Get balance for each account
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: accessToken,
        });

        return {
          connectionId: connection.id,
          institutionName: connection.institutionName,
          accounts: accountsResponse.data.accounts.map(account => {
            const balance = balanceResponse.data.accounts.find(
              b => b.account_id === account.account_id
            )?.balances;

            return {
              id: account.account_id,
              name: account.name,
              mask: account.mask,
              type: account.type,
              subtype: account.subtype,
              balance: balance?.current || 0,
              available: balance?.available || 0,
            };
          }),
        };
      } catch (error) {
        console.error('Error fetching accounts for connection:', connection.id, error);
        return null;
      }
    });

    const accountsData = (await Promise.all(accountsPromises)).filter(Boolean);

    return NextResponse.json({ connections: accountsData });
  } catch (error) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// DELETE: Disconnect a bank account
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const membership = await prisma.userOrganization.findFirst({
      where: { 
        userId: user.id,
        user: { role: 'admin' }
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Deactivate the connection
    await prisma.plaidConnection.update({
      where: {
        id: connectionId,
        organizationId: membership.organizationId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect account error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}