# Setting Up Demo Accounts

The demo accounts need to be created in Supabase Auth to allow users to login with the demo credentials shown on the login page.

## Quick Setup

1. **Get your Supabase Service Role Key:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "service_role" key (NOT the anon key)

2. **Add to .env.local:**
   ```bash
   echo 'SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"' >> .env.local
   ```

3. **Run the setup script:**
   ```bash
   node scripts/setup-demo-auth.js
   ```

## Demo Accounts

After running the script, these accounts will be available:

- **Sparkle Clean Services**
  - Email: `demo@sparkleclean.com`
  - Password: `demo123`

- **QuickFix Plumbing**
  - Email: `demo@quickfixplumbing.com`
  - Password: `demo123`

- **Bright Dental**
  - Email: `demo@brightdental.com`
  - Password: `demo123`

## Troubleshooting

If you get authentication errors:

1. Make sure you're using the service_role key, not the anon key
2. Check that your Supabase project URL is correct in .env.local
3. Ensure your Supabase project is active (not paused)

## Testing Authentication

After setting up the demo accounts:

1. Go to http://localhost:3000
2. Click "Sign In" (should go to /login)
3. Enter demo@sparkleclean.com / demo123
4. You should be redirected to /admin dashboard

## Note

The service role key has full admin access to your Supabase project. Keep it secure and never commit it to version control.