# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Test Locally
- [ ] Run `npm run build` to ensure no build errors
- [ ] Test login with demo@sparkleclean.com / demo123
- [ ] Test signup flow creates new accounts properly
- [ ] Test logout clears authentication

### 2. Environment Variables
Add ALL of these to Vercel Dashboard → Settings → Environment Variables:

**Database (Supabase)**
- [ ] `DATABASE_URL` - PostgreSQL connection string with pooler
- [ ] `DIRECT_URL` - Direct PostgreSQL connection string
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server operations)

**Application**
- [ ] `NEXT_PUBLIC_APP_URL` - Set to your Vercel domain (https://your-app.vercel.app)

**Email (Resend)**
- [ ] `RESEND_API_KEY` - Your Resend API key

**SMS (Twilio)**
- [ ] `TWILIO_ACCOUNT_SID` - Your Twilio account SID
- [ ] `TWILIO_AUTH_TOKEN` - Your Twilio auth token
- [ ] `TWILIO_PHONE_NUMBER` - Your Twilio phone number

**Payments (Stripe)**
- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

**AI Features (OpenAI)**
- [ ] `OPENAI_API_KEY` - Your OpenAI API key

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix authentication system"
git push origin main
```

### 2. Deploy to Vercel
- If connected to GitHub, it will auto-deploy
- Or use: `vercel --prod`

### 3. Post-Deployment Setup

#### Create Demo Accounts in Production
```bash
# Update .env.local with production Supabase keys
# Then run:
node scripts/setup-demo-auth.js
```

#### Set up Stripe Products (if using payments)
```bash
# Update .env.local with production Stripe keys
# Then run:
node scripts/create-stripe-products.js
```

## Verification Steps

### 1. Test Authentication
- [ ] Visit https://your-app.vercel.app
- [ ] Click "Sign In" - should go to /login
- [ ] Login with demo@sparkleclean.com / demo123
- [ ] Verify redirect to /admin dashboard
- [ ] Test logout functionality

### 2. Test Signup
- [ ] Click "Start Free Trial"
- [ ] Complete signup flow
- [ ] Verify account creation and auto-login

### 3. Test Protected Routes
- [ ] Try accessing /admin without login - should redirect to /login
- [ ] Login and verify /admin is accessible

### 4. Check Error Monitoring
- [ ] Check Vercel Functions logs for any errors
- [ ] Monitor Supabase dashboard for auth issues

## Common Issues

### "Invalid login credentials"
- Demo accounts need to be created in production Supabase
- Run the setup-demo-auth.js script with production keys

### Environment variables not working
- Ensure all variables are added to Vercel dashboard
- Redeploy after adding variables
- Check for typos in variable names

### Build failures
- Check all imports are correct
- Ensure all dependencies are in package.json
- Check for TypeScript errors with `npm run type-check`

### Database connection issues
- Verify DATABASE_URL uses the pooler endpoint (:6543)
- Check Supabase project is not paused
- Ensure IP restrictions allow Vercel

## Production Security

1. **Never commit .env.local**
   - Already in .gitignore
   - Use Vercel environment variables

2. **Protect service role key**
   - Only use in server-side code
   - Never expose to client

3. **Enable RLS in Supabase**
   - Set up Row Level Security policies
   - Test with different user roles

4. **Set up monitoring**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry)
   - Monitor Supabase usage

## Support

If deployment issues persist:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Test with minimal environment first
4. Gradually add features