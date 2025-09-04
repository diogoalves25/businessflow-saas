#!/bin/bash

# Vercel Deploy Hook Script
# This script triggers a manual deployment to Vercel

echo "🚀 Triggering Vercel deployment..."

# Trigger the deploy hook
response=$(curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_zeDWKxQXbTXxEbe3GIeu9XYu6isv/32TXMYe7pe 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Deployment triggered successfully!"
    echo "📝 Response: $response"
    echo ""
    echo "🔗 Check deployment status at: https://vercel.com/diogoalves25-projects-b58e1e69/businessflow-saas"
else
    echo "❌ Failed to trigger deployment"
    exit 1
fi