# BusinessFlow SaaS Deployment Guide

## Current Status
✅ Database schema updated with missing columns
✅ Seed data script prepared and tested
⏳ Ready to populate demo data
⏳ Ready to push to GitHub
⏳ Ready to deploy to production

## Step 1: Run Seed Data in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dxeraxbopiknkiehnbtq
2. Navigate to SQL Editor
3. Copy and paste the contents of `prisma/seed-data-final.sql`
4. Click "Run" to execute

This will create:
- 3 demo organizations (Sparkle Clean, QuickFix Plumbing, Bright Dental)
- 9 users (3 per organization with different roles)
- Services for each business type
- Sample bookings
- Sample revenue data
- Sample chat messages

## Step 2: Verify Data

Run this verification query in Supabase SQL Editor:

```sql
-- Verify organizations
SELECT id, name, "businessType", email, "subscriptionStatus" 
FROM "Organization" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Verify users
SELECT u.id, u.email, u.role, o.name as organization 
FROM "User" u
LEFT JOIN "Organization" o ON u."organizationId" = o.id
ORDER BY u."createdAt" DESC 
LIMIT 10;

-- Verify bookings
SELECT b.id, u.email as customer, s.name as service, b.date, b.status
FROM "Booking" b
JOIN "User" u ON b."customerId" = u.id
JOIN "Service" s ON b."serviceId" = s.id
ORDER BY b."createdAt" DESC
LIMIT 5;
```

## Step 3: Test Login Credentials

After seeding, you can log in with these demo accounts:

### Sparkle Clean Services
- Admin: admin@sparkleclean.com / password123
- Tech: tech@sparkleclean.com / password123
- Customer: customer@sparkleclean.com / password123

### QuickFix Plumbing
- Admin: admin@quickfixplumbing.com / password123
- Tech: tech@quickfixplumbing.com / password123
- Customer: customer@quickfixplumbing.com / password123

### Bright Dental Care
- Admin: admin@brightdental.com / password123
- Tech: dentist@brightdental.com / password123
- Customer: patient@brightdental.com / password123

## Step 4: Configure Environment Variables

Before deploying, ensure your production environment has these variables set:

```env
# Supabase (Production)
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-direct-url"
NEXT_PUBLIC_SUPABASE_URL="your-production-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-production-anon-key"

# Stripe (Production)
STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Other Services
RESEND_API_KEY="your-resend-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-number"
OPENAI_API_KEY="your-openai-key"
PLAID_CLIENT_ID="your-plaid-id"
PLAID_SECRET="your-plaid-secret"
```

## Step 5: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: BusinessFlow SaaS MVP"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/businessflow-saas.git

# Push to main branch
git push -u origin main
```

## Step 6: Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Step 7: Post-Deployment

1. Set up Stripe webhooks:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

2. Configure custom domain (optional):
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain

3. Set up monitoring:
   - Enable Vercel Analytics
   - Set up error tracking (e.g., Sentry)

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL uses the connection pooler (port 6543)
- Ensure DIRECT_URL uses the direct connection (port 5432)

### Authentication Issues
- Check Supabase Auth settings match your domain
- Ensure NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are correct

### Payment Issues
- Verify Stripe webhook secret is correct
- Check Stripe API keys (live vs test)

## Next Steps

1. Test all features with demo accounts
2. Set up production Stripe products
3. Configure email templates in Resend
4. Set up SMS templates in Twilio
5. Train AI chatbot with business-specific knowledge