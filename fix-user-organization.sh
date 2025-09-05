#!/bin/bash

# Fix userOrganization references in ads routes
files=$(grep -r "prisma.userOrganization" app/api/ads/ -l 2>/dev/null)

for file in $files; do
  echo "Fixing $file"
  
  # Replace userOrganization pattern with user pattern
  sed -i 's/prisma\.userOrganization\.findFirst({/prisma.user.findUnique({/g' "$file"
  sed -i 's/where: { userId: user\.id, user: { role: .admin. } }/where: { id: user.id }/g' "$file"
  sed -i 's/where: {\s*userId: user\.id,\s*user: { role: .admin. }\s*}/where: { id: user.id }/g' "$file"
  
  # Fix membership references
  sed -i 's/const membership = await prisma\.user/const dbUser = await prisma.user/g' "$file"
  sed -i 's/if (!membership)/if (!dbUser?.organization || dbUser.role !== '\''admin'\'')/g' "$file"
  sed -i 's/membership\.organization/dbUser.organization/g' "$file"
done

echo "Fixed all userOrganization references"