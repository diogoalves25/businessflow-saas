// Feature gating utilities for managing feature access based on subscription tiers

export type Feature = 
  | 'white-label'
  | 'advanced-analytics'
  | 'ai-chat'
  | 'team-collaboration'
  | 'api-access'
  | 'custom-integrations'
  | 'priority-support'
  | 'unlimited-users'
  | 'advanced-security'
  | 'custom-domains';

export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

// Feature availability matrix
const featureMatrix: Record<SubscriptionTier, Feature[]> = {
  free: [],
  basic: ['ai-chat'],
  professional: ['ai-chat', 'team-collaboration', 'advanced-analytics', 'api-access'],
  enterprise: [
    'ai-chat',
    'team-collaboration',
    'advanced-analytics',
    'api-access',
    'white-label',
    'custom-integrations',
    'priority-support',
    'unlimited-users',
    'advanced-security',
    'custom-domains'
  ]
};

export function hasFeature(tier: SubscriptionTier, feature: Feature): boolean {
  return featureMatrix[tier]?.includes(feature) ?? false;
}

export function getTierFeatures(tier: SubscriptionTier): Feature[] {
  return featureMatrix[tier] ?? [];
}

export function getRequiredTier(feature: Feature): SubscriptionTier | null {
  for (const [tier, features] of Object.entries(featureMatrix)) {
    if (features.includes(feature)) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

export function canAccessFeature(
  userTier: SubscriptionTier,
  requiredFeature: Feature
): boolean {
  return hasFeature(userTier, requiredFeature);
}