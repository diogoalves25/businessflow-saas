#!/bin/bash

echo "🚀 BusinessFlow Performance Check"
echo "================================"

# Check bundle sizes
echo ""
echo "📦 Checking bundle sizes..."
if [ -d ".next" ]; then
  echo "Next.js build directory found"
  # Find large JS files
  echo "Large JS files (>100KB):"
  find .next -name "*.js" -size +100k -exec ls -lh {} \; 2>/dev/null | head -10
else
  echo "No .next directory found - run 'npm run build' first"
fi

# Check node_modules size
echo ""
echo "📦 Node modules size:"
du -sh node_modules 2>/dev/null || echo "node_modules not found"

# Check for common performance issues
echo ""
echo "🔍 Checking for performance issues..."

# Check for large images
echo "Large images (>500KB):"
find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -size +500k 2>/dev/null | head -5

# Check for unused dependencies
echo ""
echo "📦 Package.json dependencies:"
cat package.json | grep -A 50 '"dependencies"' | grep -E '^\s*"[^"]+":' | wc -l | xargs -I {} echo "Total dependencies: {}"

# Memory usage
echo ""
echo "💾 Current memory usage:"
ps aux | grep node | grep -v grep | awk '{print $6/1024 " MB"}' | head -1

# Check if app is responsive
echo ""
echo "🌐 App responsiveness check:"
start_time=$(date +%s%N)
curl -s -o /dev/null -w "Homepage load time: %{time_total}s\n" http://localhost:3000 2>/dev/null || echo "App not running on port 3000"
end_time=$(date +%s%N)

# Performance recommendations
echo ""
echo "💡 Performance Optimization Tips:"
echo "1. Enable Turbopack (already enabled in package.json)"
echo "2. Use dynamic imports for heavy components"
echo "3. Optimize images with next/image"
echo "4. Enable caching for API routes"
echo "5. Use ISR for static pages with data"

echo ""
echo "✅ Performance check complete!"