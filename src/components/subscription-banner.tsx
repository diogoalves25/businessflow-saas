'use client';

import { useSubscription } from '@/src/hooks/useSubscription';
import Link from 'next/link';
import { AlertCircle, Zap } from 'lucide-react';

export function SubscriptionBanner() {
  const { subscription, isTrialing, daysLeftInTrial, loading } = useSubscription();

  if (loading || !subscription) return null;

  const showTrialWarning = isTrialing() && daysLeftInTrial() <= 7;
  const showExpiredWarning = subscription.subscriptionStatus === 'past_due' || 
                            subscription.subscriptionStatus === 'canceled' ||
                            subscription.subscriptionStatus === 'unpaid';

  if (!showTrialWarning && !showExpiredWarning) return null;

  return (
    <div className={`px-4 py-3 ${
      showExpiredWarning ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    } border-b`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className={`w-5 h-5 mr-2 ${
            showExpiredWarning ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <p className={`text-sm font-medium ${
            showExpiredWarning ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {showExpiredWarning ? (
              <>
                Your subscription has {subscription.subscriptionStatus === 'past_due' ? 'payment issues' : 'ended'}.
                Some features may be restricted.
              </>
            ) : (
              <>
                Your free trial ends in {daysLeftInTrial()} {daysLeftInTrial() === 1 ? 'day' : 'days'}.
                Upgrade now to keep all features.
              </>
            )}
          </p>
        </div>
        <Link
          href="/pricing"
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            showExpiredWarning 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          <Zap className="w-4 h-4 mr-1" />
          {showExpiredWarning ? 'Update Payment' : 'Upgrade Now'}
        </Link>
      </div>
    </div>
  );
}