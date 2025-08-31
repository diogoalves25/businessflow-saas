# Required Vercel Environment Variables

## Critical Variables (App won't work without these)

1. **DATABASE_URL**
   ```
   postgresql://postgres:2020Virtue***@db.dxeraxbopiknkiehnbtq.supabase.co:6543/postgres?pgbouncer=true
   ```

2. **DIRECT_URL**
   ```
   postgresql://postgres:2020Virtue***@db.dxeraxbopiknkiehnbtq.supabase.co:5432/postgres
   ```

3. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://dxeraxbopiknkiehnbtq.supabase.co
   ```

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZXJheGJvcGlrbmtpZWhuYnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc0ODUsImV4cCI6MjA3MjA3MzQ4NX0.rCnbEiI_JgonCDUoH8PiYC38DzGmhF6Qf47X7rSEKyY
   ```

5. **NEXT_PUBLIC_APP_URL**
   ```
   https://businessflow-saas.vercel.app
   ```

## Optional Variables (Add when ready to use features)

### Stripe (Payments)
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

### Email (Resend)
- RESEND_API_KEY

### SMS (Twilio)
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### AI Chatbot
- OPENAI_API_KEY

### Payroll (Plaid)
- PLAID_CLIENT_ID
- PLAID_SECRET
- PLAID_ENV
- PLAID_PRODUCTS
- PLAID_COUNTRY_CODES

## How to Add in Vercel

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable above
4. Make sure to select all environments (Production, Preview, Development)
5. Save and redeploy

## Debugging URLs

After deployment, check these URLs:
- https://businessflow-saas.vercel.app/deployment-test.txt
- https://businessflow-saas.vercel.app/debug
- https://businessflow-saas.vercel.app/api/debug