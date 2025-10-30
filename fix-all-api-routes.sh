#!/bin/bash

# Find ALL route files and fix them
find src/app/api -type f \( -name "route.ts" -o -name "route.js" \) | while read file; do
  if ! grep -q "export const dynamic" "$file"; then
    echo "Fixing $file"
    sed -i '1i export const dynamic = '\''force-dynamic'\'';\nexport const runtime = '\''nodejs'\'';\n' "$file"
  else
    echo "Skipping $file (already has dynamic export)"
  fi
done

echo "Done!"