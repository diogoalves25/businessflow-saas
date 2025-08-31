'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlanType, canAccessFeature, PLAN_LIMITS } from '@/src/lib/feature-gating';

interface SubscriptionData {
  organizationId: string;
  currentPlan: PlanType;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

interface UsageData {
  bookings: {
    current: number;
    limit: number;
    canAddMore: boolean;
  };
  teamMembers: {
    current: number;
    limit: number;
    canAddMore: boolean;
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/user/organization');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        return;
      }

      const data = await response.json();
      setSubscription({
        organizationId: data.organizationId,
        currentPlan: data.currentPlan || 'trial',
        subscriptionStatus: data.subscriptionStatus,
        trialEndsAt: data.trialEndsAt,
        subscriptionEndsAt: data.subscriptionEndsAt,
      });

      // Fetch usage data
      const usageResponse = await fetch(`/api/organization/${data.organizationId}/usage`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (feature: keyof typeof PLAN_LIMITS['starter']): boolean => {
    if (!subscription) return false;
    return canAccessFeature(subscription.currentPlan, feature);
  };

  const requireFeature = (feature: keyof typeof PLAN_LIMITS['starter'], message?: string) => {
    if (!canAccess(feature)) {
      toast.error(message || `This feature requires a higher plan. Please upgrade to continue.`);
      router.push('/pricing');
      return false;
    }
    return true;
  };

  const checkBookingLimit = (): boolean => {
    if (!usage) return false;
    return usage.bookings.canAddMore;
  };

  const checkTeamMemberLimit = (): boolean => {
    if (!usage) return false;
    return usage.teamMembers.canAddMore;
  };

  const isTrialing = (): boolean => {
    if (!subscription) return false;
    return subscription.subscriptionStatus === 'trialing' || 
           (subscription.trialEndsAt ? new Date(subscription.trialEndsAt) > new Date() : false);
  };

  const daysLeftInTrial = (): number => {
    if (!subscription?.trialEndsAt) return 0;
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return {
    subscription,
    usage,
    loading,
    canAccess,
    requireFeature,
    checkBookingLimit,
    checkTeamMemberLimit,
    isTrialing,
    daysLeftInTrial,
    refetch: fetchSubscriptionData,
  };
}