# Supabase Migration Guide

This guide will help you complete the migration from SQLite to Supabase for the BusinessFlow SaaS platform.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon Key (public)
   - Database password

## Step-by-Step Migration

### 1. Update Environment Variables

Replace the placeholders in `.env.local`:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

You can find these values in your Supabase project:
- Go to Settings → API
- Copy the Project URL and anon key
- For the database URL, go to Settings → Database and copy the connection string

### 2. Run Prisma Migrations

Once you've updated the environment variables, run:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# Run the seed script to populate initial data
npm run db:seed
```

### 3. Enable Row Level Security (RLS)

Go to your Supabase dashboard and run these SQL commands in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Revenue" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own organization's data
CREATE POLICY "Users can view own organization" ON "Organization"
  FOR SELECT USING (
    id IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can see other users in their organization
CREATE POLICY "Users can view organization members" ON "User"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can view services from their organization
CREATE POLICY "Users can view organization services" ON "Service"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can view bookings from their organization
CREATE POLICY "Users can view organization bookings" ON "Booking"
  FOR SELECT USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "User" 
      WHERE id = auth.uid()
    )
  );

-- Policy: Public access to revenue data (for demo)
CREATE POLICY "Public can view revenue" ON "Revenue"
  FOR SELECT USING (true);
```

### 4. Set Up Authentication

In your Supabase dashboard:

1. Go to Authentication → Providers
2. Enable Email/Password authentication
3. Optionally enable social providers (Google, GitHub, etc.)
4. Configure email templates under Authentication → Email Templates

### 5. Update API Routes

The API routes need to be updated to use Supabase client instead of Prisma directly. Here's what needs to be done:

1. Remove NextAuth configuration
2. Update authentication checks to use Supabase
3. Add proper authorization checks using RLS

### 6. Update Frontend Components

Components that need updating:
- Login page
- Signup page
- Admin dashboard authentication
- Booking page authentication

### 7. Deploy to Vercel

Once everything is working locally:

```bash
# Commit your changes
git add .
git commit -m "Migrate to Supabase"
git push

# In Vercel, add environment variables:
# - DATABASE_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Benefits of This Migration

1. **Production-Ready Database**: PostgreSQL works perfectly with Vercel
2. **Built-in Authentication**: No need for NextAuth complexity
3. **Row Level Security**: True multi-tenancy at the database level
4. **Real-time Capabilities**: Subscribe to database changes
5. **File Storage**: Built-in storage for images/files
6. **Edge Functions**: Run server-side code at the edge

## Next Steps After Migration

1. Add more RLS policies for INSERT, UPDATE, DELETE operations
2. Set up Supabase Realtime for live updates
3. Implement magic link authentication
4. Add social login providers
5. Set up database backups in Supabase

## Troubleshooting

### Common Issues:

1. **"relation does not exist"**: Run `npx prisma db push` to create tables
2. **"permission denied"**: Check RLS policies are correctly set
3. **Authentication errors**: Ensure environment variables are correct
4. **CORS errors**: Add your domain to Supabase allowed URLs

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)