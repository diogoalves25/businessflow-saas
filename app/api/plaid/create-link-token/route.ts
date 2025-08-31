import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '@/src/lib/plaid';
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

    // Check if user has Premium plan
    if (!canAccessFeature(membership.organization.stripePriceId, 'hasPayroll')) {
      return NextResponse.json(
        { error: 'Payroll automation requires Premium plan' },
        { status: 403 }
      );
    }

    // Create a link token for the user
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: membership.organization.businessName,
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    });

    return NextResponse.json({
      link_token: linkTokenResponse.data.link_token,
    });
  } catch (error) {
    console.error('Create link token error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}