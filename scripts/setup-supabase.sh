#!/bin/bash

echo "🚀 BusinessFlow Supabase Setup Script"
echo "====================================="
echo ""
echo "Before running this script, make sure you have:"
echo "1. Created a Supabase project"
echo "2. Updated .env.local with your Supabase credentials"
echo ""
read -p "Have you completed these steps? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Please complete the prerequisites first:"
    echo "1. Go to https://supabase.com and create a project"
    echo "2. Update .env.local with your credentials"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "📤 Pushing schema to Supabase..."
npx prisma db push

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the contents of supabase/setup.sql"
echo "4. Test the app with: npm run dev"
echo ""
echo "Demo credentials:"
echo "Email: demo@sparkleclean.com"
echo "Password: demo123"