#!/bin/bash

# Replace CleanFlow with BusinessFlow in all files
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/CleanFlow/BusinessFlow/g' {} \;

# Replace cleanflow with businessflow in all files
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.md" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/cleanflow/businessflow/g' {} \;

# Update specific cleaning-related text to be business-neutral
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/cleaning business/service business/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/Cleaning Business/Service Business/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/cleaning service/service/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i 's/cleaning professionals/service professionals/g' {} \;

echo "Global rename completed!"