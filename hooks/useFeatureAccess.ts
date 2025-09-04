'use client';

import { useOrganization } from './useOrganization';
import { hasFeature, Feature, SubscriptionTier } from '@/lib/feature-gating';

export function useFeatureAccess(feature: Feature) {
  const { organization, loading } = useOrganization();
  
  const hasAccess = organization 
    ? hasFeature(organization.subscriptionTier as SubscriptionTier, feature)
    : false;
  
  const isLoading = loading;
  
  const requiredTier = organization?.subscriptionTier === 'enterprise' 
    ? null 
    : (hasAccess ? null : 'enterprise');

  return {
    hasAccess,
    isLoading,
    requiredTier,
    currentTier: organization?.subscriptionTier || 'free',
  };
}