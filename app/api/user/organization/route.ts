import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's membership and organization
    const membership = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: {
        organization: true
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Determine current plan based on price ID
    let currentPlan = null;
    if (membership.organization.stripePriceId) {
      // Map price IDs to plan names
      const priceIdToPlan: Record<string, string> = {
        [process.env.STRIPE_PRICE_STARTER_ID || '']: 'starter',
        [process.env.STRIPE_PRICE_GROWTH_ID || '']: 'growth',
        [process.env.STRIPE_PRICE_PREMIUM_ID || '']: 'premium',
      };
      currentPlan = priceIdToPlan[membership.organization.stripePriceId] || null;
    }

    return NextResponse.json({
      organizationId: membership.organization.id,
      organizationName: membership.organization.businessName,
      currentPlan,
      subscriptionStatus: membership.organization.subscriptionStatus,
      trialEndsAt: membership.organization.trialEndsAt,
      subscriptionEndsAt: membership.organization.subscriptionEndsAt,
    });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}