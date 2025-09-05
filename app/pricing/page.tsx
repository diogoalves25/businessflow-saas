'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/src/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ID || '',
    features: [
      'Up to 50 bookings/month',
      'Basic scheduling',
      '3 team members',
      'Email support',
      'Customer database',
      'Basic reporting'
    ],
    recommended: false
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 59.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ID || '',
    features: [
      'Up to 200 bookings/month',
      'Advanced scheduling & routing',
      '10 team members',
      'Priority support',
      'Automated payroll',
      'Marketing tools',
      'Advanced analytics'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ID || '',
    features: [
      'Unlimited bookings',
      'AI-powered optimization',
      'Unlimited team members',
      'Dedicated support',
      'White-label options',
      'API access',
      'Custom integrations'
    ],
    recommended: false
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's organization
      try {
        const response = await fetch('/api/user/organization');
        if (response.ok) {
          const data = await response.json();
          setOrganizationId(data.organizationId);
          setCurrentPlan(data.currentPlan);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleSelectPlan = async (priceId: string) => {
    if (!stripePromise) {
      toast.error('Stripe is not configured');
      return;
    }

    if (!organizationId) {
      toast.error('No organization found');
      return;
    }

    setLoading(true);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          organizationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!organizationId) {
      toast.error('No organization found');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-blue-600">Subscription Plans</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Upgrade or downgrade at any time
          </p>
        </div>

        {currentPlan && (
          <div className="text-center mb-8">
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Manage billing & view invoices
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg p-8 ${
                  plan.recommended ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {isCurrentPlan && (
                    <span className="inline-block mt-2 text-sm font-medium text-green-600">
                      Current Plan
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSelectPlan(plan.priceId)}
                  disabled={loading || isCurrentPlan || !plan.priceId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">All plans include a 14-day free trial</p>
          <p className="text-sm">
            Questions? Email us at{' '}
            <a href="mailto:support@businessflow.com" className="text-blue-600 hover:text-blue-700">
              support@businessflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}