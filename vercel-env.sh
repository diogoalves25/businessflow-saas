#!/bin/bash

# Set environment variables in Vercel

echo "Setting up Vercel environment variables..."

# Database
vercel env add DATABASE_URL production < <(echo "postgresql://postgres:2020Virtue***@db.dxeraxbopiknkiehnbtq.supabase.co:6543/postgres?pgbouncer=true")
vercel env add DIRECT_URL production < <(echo "postgresql://postgres:2020Virtue***@db.dxeraxbopiknkiehnbtq.supabase.co:5432/postgres")

# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production < <(echo "https://dxeraxbopiknkiehnbtq.supabase.co")
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZXJheGJvcGlrbmtpZWhuYnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc0ODUsImV4cCI6MjA3MjA3MzQ4NX0.rCnbEiI_JgonCDUoH8PiYC38DzGmhF6Qf47X7rSEKyY")
vercel env add SUPABASE_SERVICE_ROLE_KEY production < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZXJheGJvcGlrbmtpZWhuYnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ5NzQ4NSwiZXhwIjoyMDcyMDczNDg1fQ.6NVRsTnhmRsDYhsfbb3TtF15j-FgM34AN5Dnx2uKHss")

# Stripe (test keys)
vercel env add STRIPE_SECRET_KEY production < <(echo "sk_test_YOUR_SECRET_KEY")
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production < <(echo "pk_test_YOUR_PUBLISHABLE_KEY")
vercel env add STRIPE_WEBHOOK_SECRET production < <(echo "whsec_YOUR_WEBHOOK_SECRET")

# App URL (will be updated after deployment)
vercel env add NEXT_PUBLIC_APP_URL production < <(echo "https://businessflow-saas-v2-diogos-projects-b58e1e69.vercel.app")

# Email (Resend)
vercel env add RESEND_API_KEY production < <(echo "re_YOUR_API_KEY")

# Twilio
vercel env add TWILIO_ACCOUNT_SID production < <(echo "AC_YOUR_ACCOUNT_SID")
vercel env add TWILIO_AUTH_TOKEN production < <(echo "YOUR_AUTH_TOKEN")
vercel env add TWILIO_PHONE_NUMBER production < <(echo "+1YOUR_PHONE_NUMBER")

# OpenAI
vercel env add OPENAI_API_KEY production < <(echo "sk-YOUR_API_KEY")

# Plaid
vercel env add PLAID_CLIENT_ID production < <(echo "your_client_id")
vercel env add PLAID_SECRET production < <(echo "your_secret_key")
vercel env add PLAID_ENV production < <(echo "sandbox")
vercel env add PLAID_PRODUCTS production < <(echo "auth,transactions,identity")
vercel env add PLAID_COUNTRY_CODES production < <(echo "US")

echo "Environment variables set successfully!"