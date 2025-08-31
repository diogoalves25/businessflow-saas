-- Add Stripe fields to Organization table
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3) DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS "subscriptionEndsAt" TIMESTAMP(3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_stripe_customer ON "Organization"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS idx_organization_subscription_status ON "Organization"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS idx_organization_trial_ends ON "Organization"("trialEndsAt");