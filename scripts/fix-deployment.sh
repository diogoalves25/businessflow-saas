#!/bin/bash

echo "🔧 BusinessFlow SaaS Deployment Fix Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in BusinessFlow SaaS directory${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 1: Checking local environment${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local found${NC}"
else
    echo -e "${RED}✗ .env.local not found${NC}"
    echo "Creating .env.local from example..."
    cp .env.example .env.local 2>/dev/null || echo "No .env.example found"
fi

echo -e "\n${YELLOW}Step 2: Installing dependencies${NC}"
npm install

echo -e "\n${YELLOW}Step 3: Generating Prisma client${NC}"
npx prisma generate

echo -e "\n${YELLOW}Step 4: Building project locally${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Please fix build errors before deploying"
    exit 1
fi

echo -e "\n${YELLOW}Step 5: Vercel deployment checklist${NC}"
echo "Please ensure you have:"
echo "1. Set all environment variables in Vercel dashboard"
echo "2. Selected all environments (Production, Preview, Development)"
echo "3. Cleared browser cache/cookies"

echo -e "\n${YELLOW}Step 6: Deploy to Vercel${NC}"
echo "Run one of these commands:"
echo -e "${GREEN}vercel --prod${NC} (for production)"
echo -e "${GREEN}vercel --force${NC} (to force rebuild without cache)"

echo -e "\n${YELLOW}Important URLs to check after deployment:${NC}"
echo "- https://businessflow-saas.vercel.app/debug"
echo "- https://businessflow-saas.vercel.app/login"
echo "- https://businessflow-saas.vercel.app/api/debug"

echo -e "\n${GREEN}✓ Fix script completed!${NC}"