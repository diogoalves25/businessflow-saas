#!/bin/bash

# Fix the where clause in all ads API routes
files=$(find app/api/ads -name "*.ts" -type f)

for file in $files; do
  # Check if file contains the problematic pattern
  if grep -q "userId: user.id" "$file"; then
    echo "Fixing $file"
    
    # Create a temporary file with the fixes
    sed -e '/where: {/{
      N
      N
      N
      s/where: {\s*\n\s*userId: user\.id,\s*\n\s*user: { role: .admin. }\s*\n\s*}/where: { id: user.id }/
    }' "$file" > "$file.tmp"
    
    # Replace original file
    mv "$file.tmp" "$file"
  fi
done

echo "Fixed all where clauses"