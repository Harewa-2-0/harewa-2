#!/bin/bash

# List of all API route files
files=(
"src/app/api/analytics/route.ts"
"src/app/api/auth/forgot-password/route.ts"
"src/app/api/auth/google/callback/route.ts"
"src/app/api/auth/login/route.ts"
"src/app/api/auth/me/route.ts"
"src/app/api/auth/profile/address/[addressId]/route.ts"
"src/app/api/auth/profile/picture/route.ts"
"src/app/api/auth/profile/route.ts"
"src/app/api/auth/refresh/route.ts"
"src/app/api/auth/resend/route.ts"
"src/app/api/auth/reset-password/route.ts"
"src/app/api/auth/signup/route.ts"
"src/app/api/auth/verify/route.ts"
"src/app/api/cart/[id]/clear/route.ts"
"src/app/api/cart/[id]/product/[productId]/route.ts"
"src/app/api/cart/[id]/route.ts"
"src/app/api/cart/me/route.ts"
"src/app/api/cart/route.ts"
"src/app/api/custom-request/route.ts"
"src/app/api/customization/route.ts"
"src/app/api/fabric/[id]/route.ts"
"src/app/api/fabric/route.ts"
"src/app/api/fashion-chat/route.ts"
"src/app/api/order/[id]/route.ts"
"src/app/api/order/me/route.ts"
"src/app/api/order/route.ts"
"src/app/api/payment/paystack/callback/route.ts"
"src/app/api/payment/purchase/route.ts"
"src/app/api/product-category/[id]/route.ts"
"src/app/api/product-category/route.ts"
"src/app/api/product/[id]/route.ts"
"src/app/api/product/bulk/route.ts"
"src/app/api/product/category/[id]/route.ts"
"src/app/api/product/route.ts"
"src/app/api/product/seller/[id]/route.ts"
"src/app/api/product/shop/[id]/route.ts"
"src/app/api/reviews/[id]/route.ts"
"src/app/api/reviews/route.ts"
"src/app/api/shop/[id]/route.ts"
"src/app/api/shop/route.ts"
"src/app/api/wallet/[id]/route.ts"
"src/app/api/wallet/route.ts"
"src/app/api/wishlist/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if it already has the dynamic export
    if ! grep -q "export const dynamic" "$file"; then
      echo "Fixing $file"
      # Add the exports at the beginning after any existing imports
      sed -i '1i export const dynamic = '\''force-dynamic'\'';\nexport const runtime = '\''nodejs'\'';\n' "$file"
    else
      echo "Skipping $file (already has dynamic export)"
    fi
  else
    echo "File not found: $file"
  fi
done

echo "Done!"