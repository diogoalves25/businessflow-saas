import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { getPlanFromPriceId, canAccessFeature, PlanType, checkBookingLimit, checkTeamMemberLimit, PLAN_LIMITS } from './feature-gating';

export interface SubscriptionInfo {
  organizationId: string;
  plan: PlanType;
  subscriptionStatus: string | null;
  isTrialing: boolean;
  canAccess: (feature: keyof typeof PLAN_LIMITS['starter']) => boolean;
}

export async function getSubscriptionInfo(userId?: string): Promise<SubscriptionInfo | null> {
  try {
    // Get current user if not provided
    if (!userId) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true
      }
    });

    if (!user || !user.organization) return null;

    const organization = user.organization;
    const plan = getPlanFromPriceId(organization.stripePriceId);
    const isTrialing = organization.subscriptionStatus === 'trialing' || 
                      (organization.trialEndsAt ? new Date(organization.trialEndsAt) > new Date() : false);

    return {
      organizationId: organization.id,
      plan,
      subscriptionStatus: organization.subscriptionStatus,
      isTrialing,
      canAccess: (feature) => canAccessFeature(plan, feature),
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return null;
  }
}

export async function requireSubscription(
  feature?: keyof typeof PLAN_LIMITS['starter']
): Promise<SubscriptionInfo> {
  const subscriptionInfo = await getSubscriptionInfo();
  
  if (!subscriptionInfo) {
    throw new Error('No subscription found');
  }

  if (feature && !subscriptionInfo.canAccess(feature)) {
    throw new Error(`Feature "${feature}" requires a higher plan`);
  }

  return subscriptionInfo;
}

export async function checkUsageLimits(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      bookings: {
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
          }
        }
      },
      users: true,
    }
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const plan = getPlanFromPriceId(organization.stripePriceId);
  const currentBookings = organization.bookings.length;
  const currentMembers = organization.users.length;

  return {
    bookings: {
      current: currentBookings,
      limit: PLAN_LIMITS[plan].maxBookingsPerMonth,
      canAddMore: checkBookingLimit(plan, currentBookings),
    },
    teamMembers: {
      current: currentMembers,
      limit: PLAN_LIMITS[plan].maxTeamMembers,
      canAddMore: checkTeamMemberLimit(plan, currentMembers),
    },
  };
}