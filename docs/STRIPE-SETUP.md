# Stripe Subscription Setup Guide

## Overview
We've successfully integrated Stripe subscription management into BusinessFlow SaaS. This allows businesses to subscribe to different plans with a 14-day free trial.

## What's Been Implemented

### 1. Database Schema Updates
- Added Stripe fields to the Organization model:
  - `stripeCustomerId` - Unique Stripe customer ID
  - `stripeSubscriptionId` - Active subscription ID
  - `stripePriceId` - Current plan's price ID
  - `subscriptionStatus` - Status (trialing, active, past_due, canceled, etc.)
  - `trialEndsAt` - Trial expiration date (14 days from signup)
  - `subscriptionEndsAt` - Subscription end date

### 2. Stripe Products & Pricing
Three subscription tiers have been configured:
- **Starter** - $29.99/month
  - Up to 50 bookings/month
  - 3 team members
  - Basic features
- **Growth** - $59.99/month (Most Popular)
  - Up to 200 bookings/month
  - 10 team members
  - Advanced features
- **Premium** - $99.99/month
  - Unlimited bookings
  - Unlimited team members
  - All features + API access

### 3. API Routes
- `/api/stripe/create-checkout-session` - Creates Stripe checkout for new subscriptions
- `/api/stripe/create-portal-session` - Opens Stripe billing portal for existing customers
- `/api/stripe/webhook` - Handles Stripe webhook events
- `/api/user/organization` - Gets user's organization and subscription info
- `/api/organization/[id]/usage` - Checks usage against plan limits

### 4. Feature Gating System
Implemented comprehensive feature gating:
- Plan-based feature access control
- Usage limit checking (bookings, team members)
- React hook (`useSubscription`) for client-side checks
- Server-side helpers for API protection

### 5. UI Components
- Updated signup flow to redirect to Stripe Checkout
- Created pricing page for plan selection/upgrades
- Added subscription banner showing trial/payment warnings
- Added billing menu item in admin dashboard

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:
```env
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Stripe Price IDs (after running setup script)
STRIPE_PRICE_STARTER_ID="price_xxx"
STRIPE_PRICE_GROWTH_ID="price_xxx"
STRIPE_PRICE_PREMIUM_ID="price_xxx"
```

### 2. Create Stripe Products
1. Get your Stripe API keys from https://dashboard.stripe.com/test/apikeys
2. Add them to `.env.local`
3. Run the setup script:
   ```bash
   node scripts/create-stripe-products.js
   ```
4. Copy the generated price IDs to your `.env.local`

### 3. Configure Stripe Webhook
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Test the Integration
1. Sign up for a new account - you'll be redirected to Stripe Checkout
2. Use test card: `4242 4242 4242 4242` (any future expiry/CVC)
3. After payment, you'll be redirected back to the admin dashboard
4. Check the subscription banner and billing page

## Usage Examples

### Client-Side Feature Gating
```typescript
import { useSubscription } from '@/src/hooks/useSubscription';

function MyComponent() {
  const { canAccess, requireFeature } = useSubscription();
  
  // Check feature access
  if (!canAccess('hasAdvancedAnalytics')) {
    return <UpgradePrompt />;
  }
  
  // Or use requireFeature to auto-redirect to pricing
  const handleAdvancedFeature = () => {
    if (!requireFeature('hasAIOptimization')) return;
    // Feature code here
  };
}
```

### Server-Side Protection
```typescript
import { requireSubscription } from '@/src/lib/subscription-check';

export async function POST(request: Request) {
  const subscription = await requireSubscription('hasAPIAccess');
  // API route code here
}
```

### Check Usage Limits
```typescript
import { checkUsageLimits } from '@/src/lib/subscription-check';

const usage = await checkUsageLimits(organizationId);
if (!usage.bookings.canAddMore) {
  throw new Error('Booking limit reached for your plan');
}
```

## Next Steps
1. Replace test Stripe keys with production keys
2. Set up production webhook endpoint
3. Configure billing portal settings in Stripe Dashboard
4. Add more granular feature gates as needed
5. Implement usage tracking for bookings/team members

## Troubleshooting
- If checkout fails, ensure Stripe keys are correctly set
- For webhook issues, check the webhook logs in Stripe Dashboard
- Make sure Supabase auth is working before testing subscriptions