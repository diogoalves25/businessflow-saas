// Feature gating based on subscription plans

export type PlanType = 'starter' | 'growth' | 'premium' | 'trial';

interface PlanLimits {
  maxBookingsPerMonth: number;
  maxTeamMembers: number;
  hasAdvancedScheduling: boolean;
  hasAutomatedPayroll: boolean;
  hasMarketingTools: boolean;
  hasAdvancedAnalytics: boolean;
  hasAIOptimization: boolean;
  hasWhiteLabel: boolean;
  hasAPIAccess: boolean;
  hasCustomIntegrations: boolean;
  hasPayroll: boolean;
  hasAds: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  trial: {
    maxBookingsPerMonth: 10,
    maxTeamMembers: 2,
    hasAdvancedScheduling: false,
    hasAutomatedPayroll: false,
    hasMarketingTools: false,
    hasAdvancedAnalytics: false,
    hasAIOptimization: false,
    hasWhiteLabel: false,
    hasAPIAccess: false,
    hasCustomIntegrations: false,
    hasPayroll: false,
    hasAds: false,
  },
  starter: {
    maxBookingsPerMonth: 50,
    maxTeamMembers: 3,
    hasAdvancedScheduling: false,
    hasAutomatedPayroll: false,
    hasMarketingTools: false,
    hasAdvancedAnalytics: false,
    hasAIOptimization: false,
    hasWhiteLabel: false,
    hasAPIAccess: false,
    hasCustomIntegrations: false,
    hasPayroll: false,
    hasAds: false,
  },
  growth: {
    maxBookingsPerMonth: 200,
    maxTeamMembers: 10,
    hasAdvancedScheduling: true,
    hasAutomatedPayroll: true,
    hasMarketingTools: true,
    hasAdvancedAnalytics: true,
    hasAIOptimization: false,
    hasWhiteLabel: false,
    hasAPIAccess: false,
    hasCustomIntegrations: false,
    hasPayroll: false,
    hasAds: false,
  },
  premium: {
    maxBookingsPerMonth: Infinity,
    maxTeamMembers: Infinity,
    hasAdvancedScheduling: true,
    hasAutomatedPayroll: true,
    hasMarketingTools: true,
    hasAdvancedAnalytics: true,
    hasAIOptimization: true,
    hasWhiteLabel: true,
    hasAPIAccess: true,
    hasCustomIntegrations: true,
    hasPayroll: true,
    hasAds: true,
  },
};

export function getPlanFromPriceId(priceId: string | null): PlanType {
  if (!priceId) return 'trial';
  
  const priceIdToPlan: Record<string, PlanType> = {
    [process.env.STRIPE_PRICE_STARTER_ID || '']: 'starter',
    [process.env.STRIPE_PRICE_GROWTH_ID || '']: 'growth',
    [process.env.STRIPE_PRICE_PREMIUM_ID || '']: 'premium',
  };
  
  return priceIdToPlan[priceId] || 'trial';
}

export function canAccessFeature(
  priceIdOrPlan: string | null | PlanType,
  feature: keyof PlanLimits
): boolean {
  // If it's a price ID (string), convert to plan type
  const plan = (priceIdOrPlan === 'trial' || priceIdOrPlan === 'starter' || 
                priceIdOrPlan === 'growth' || priceIdOrPlan === 'premium') 
    ? priceIdOrPlan 
    : getPlanFromPriceId(priceIdOrPlan as string | null);
    
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For numeric limits, return true if within limit
  // This would need to be checked against actual usage
  return true;
}

export function checkBookingLimit(
  plan: PlanType,
  currentBookings: number
): boolean {
  const limits = PLAN_LIMITS[plan];
  return currentBookings < limits.maxBookingsPerMonth;
}

export function checkTeamMemberLimit(
  plan: PlanType,
  currentMembers: number
): boolean {
  const limits = PLAN_LIMITS[plan];
  return currentMembers < limits.maxTeamMembers;
}