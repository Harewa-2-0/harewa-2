# Currency Migration Plan: Naira (₦) → Dollar ($)

## Centralized Utility Approach

---

## Step 1: Create Currency Utility

**File:** `src/utils/currency.ts` (NEW)

```typescript
/**
 * Centralized currency configuration
 * Change currency in ONE place - affects entire app
 */
export const CURRENCY_CONFIG = {
  code: 'USD',
  symbol: '$',
  locale: 'en-US',
} as const;

/**
 * Format price as currency
 * Handles both number and string inputs
 * 
 * @example
 * formatPrice(1234.56) // "$1,234.56"
 * formatPrice("5000") // "$5,000.00"
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return `${CURRENCY_CONFIG.symbol}0.00`;
  }
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Format amount without currency symbol (just number)
 * 
 * @example
 * formatAmount(1234.56) // "1,234.56"
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Get currency code
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.code;
}
```

---

## Step 2: Update Public Components (15 files)

### Group A: Cart Components (5 files)

**1. `src/components/Public_C/shop/cart.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**2. `src/components/Public_C/cart/cart-items.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**3. `src/components/Public_C/cart/checkout-section.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**4. `src/components/Public_C/checkout/cart-summary.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**5. `src/components/Public_C/customize/CustomizationPanel.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

---

### Group B: Product Display Components (5 files)

**6. `src/components/Public_C/Ready_To_Wear/ProductCard.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**7. `src/components/Public_C/Ready_To_Wear/ProductCheckoutCard.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**8. `src/components/Public_C/Ready_To_Wear/RecommendedProducts.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**9. `src/components/Public_C/Home/new_Arivals.tsx`**
```typescript
// Find: NGN in template literals
// Replace with: formatPrice() calls
// Add: import { formatPrice } from '@/utils/currency';
```

**10. `src/components/Public_C/Ready_To_Wear/Sidebar.tsx`**
```typescript
// Check for NGN/₦ in price range display
// Update to use formatPrice
```

---

### Group C: Profile Components (3 files)

**11. `src/components/Protected/profile/orders/order-card.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**12. `src/components/Protected/profile/orders/order-details-modal.tsx`**
```typescript
// Remove: const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
// Add: import { formatPrice } from '@/utils/currency';
```

**13. `src/components/Protected/profile/wishlist/wishlist-section.tsx`**
```typescript
// Check for NGN/₦ usage
// Update to use formatPrice
```

---

## Step 3: Update Admin Components (12 files)

### Group D: Admin Product Management (3 files)

**14. `src/components/Protected/admin/pages/products/ProductsTable.tsx`**
```typescript
// Find: NGN formatting
// Replace with: import { formatPrice } from '@/utils/currency';
```

**15. `src/components/Protected/admin/pages/products/Add-product/ProductInformationStep.tsx`**
```typescript
// Update labels: "Price (NGN)" → "Price (USD)"
// Update placeholder: "Enter price in Naira" → "Enter price in USD"
```

**16. `src/components/Protected/admin/pages/products/EditProductModal.tsx`**
```typescript
// Update labels: "Price (NGN)" → "Price (USD)"
// Update formatPrice calls
```

---

### Group E: Admin Order Management (5 files)

**17. `src/components/Protected/admin/pages/orders/OrdersTable.tsx`**
```typescript
// Find: NGN formatting
// Replace with: import { formatPrice } from '@/utils/currency';
```

**18. `src/components/Protected/admin/pages/orders/print/OrderPrintHeader.tsx`**
```typescript
// Remove: Intl.NumberFormat('en-NG', { currency: 'NGN' })
// Add: import { formatPrice } from '@/utils/currency';
```

**19. `src/components/Protected/admin/pages/orders/print/OrderPrintItems.tsx`**
```typescript
// Remove: const formatCurrency = ... 'NGN'
// Add: import { formatPrice } from '@/utils/currency';
```

**20. `src/components/Protected/admin/pages/orders/print/OrderPrintSummary.tsx`**
```typescript
// Remove: Intl.NumberFormat('en-NG', { currency: 'NGN' })
// Add: import { formatPrice } from '@/utils/currency';
```

**21. `src/components/Protected/admin/pages/orders/print/OrderPrintFooter.tsx`**
```typescript
// Check for currency mentions
// Update if needed
```

---

### Group F: Admin Fabric Management (4 files)

**22. `src/components/Protected/admin/pages/fabrics/FabricsTable.tsx`**
```typescript
// Find: NGN/₦ in price per meter
// Replace with: formatPrice
```

**23. `src/components/Protected/admin/pages/fabrics/AddFabricModal.tsx`**
```typescript
// Update label: "Price per Meter (NGN)" → "Price per Meter (USD)"
```

**24. `src/components/Protected/admin/pages/fabrics/EditFabricModal.tsx`**
```typescript
// Update label: "Price per Meter (NGN)" → "Price per Meter (USD)"
```

**25. `src/components/Protected/admin/pages/fabrics/FabricTypeDropdown.tsx`**
```typescript
// Check for currency display
// Update if needed
```

---

## Step 4: Update Services/Utils (5 files)

**26. `src/services/dashboard.ts`**
```typescript
// Find: NGN formatting
// Replace with: import { formatPrice }
```

**27. `src/services/analytics.ts`**
```typescript
// Find: NGN formatting
// Replace with: import { formatPrice }
```

**28. `src/lib/paystack.ts`**
```typescript
// Note: Paystack is commented out for now
// Update currency references for future use
```

**29. `src/lib/sendInvoice.ts`**
```typescript
// Update email invoice template
// Replace NGN → USD
// Replace ₦ → $
```

**30. `src/lib/sendReceipts.ts`**
```typescript
// Update receipt template
// Replace NGN → USD
// Replace ₦ → $
```

---

## Step 5: Update Admin Mock Data

**31. `src/components/Protected/admin/pages/data/mockData.tsx`**
```typescript
// Update mock prices if any have currency strings
```

---

## Step 6: Documentation & Markdown Files

**32. `PRICING_FIXES.md`**
```typescript
// Update examples showing NGN → USD
```

---

## 🧪 Testing Checklist

### Frontend Display:
- [ ] Homepage - Products show "$" not "₦"
- [ ] Shop page - Products show "$1,234.56" format
- [ ] Product detail - Price shows in USD
- [ ] Cart - All prices show in USD
- [ ] Checkout - Summary shows USD
- [ ] Profile orders - Order amounts in USD

### Admin Panel:
- [ ] Product creation - Label says "USD"
- [ ] Product table - Prices in USD
- [ ] Orders table - Amounts in USD
- [ ] Fabric management - Price per meter in USD
- [ ] Print invoices - Currency is USD

### Calculations:
- [ ] Cart total calculation - Correct USD amounts
- [ ] Checkout total - Matches cart
- [ ] Order amount - Correct USD
- [ ] No currency conversion errors

---

## ⚠️ Important Considerations

### 1. Backend Currency
**Question:** Does your backend store prices as numbers (5000) or strings ("NGN 5000")?

**If numbers:** ✅ We're good - just change frontend display  
**If strings with currency:** ⚠️ Need backend migration too

### 2. Stripe Integration
**Current:** Stripe expects amounts in cents (USD)

**Example:**
```typescript
// $50.00 USD = 5000 cents
const stripeAmount = Math.round(price * 100);
```

**Verify:** Stripe integration handles USD correctly

### 3. Existing Orders
**Database:** Existing orders may have NGN amounts

**Options:**
- a) Display old orders "as-is" (NGN amounts shown as USD - incorrect)
- b) Add migration flag to orders (track currency)
- c) Only new orders use USD (old orders still show NGN)

**Recommendation:** Option A for now (simple), add currency field to orders later

---

## 🎯 Rollout Strategy

### Phase 1: Create Utility + Update Components
- Create `src/utils/currency.ts`
- Update all 32 files to use utility
- Test frontend display

### Phase 2: Update Admin Forms
- Change labels (NGN → USD)
- Update placeholders
- Test product creation

### Phase 3: Verify Backend
- Check if backend needs updates
- Verify Stripe integration
- Test end-to-end order flow

---

## 📊 Benefits

**Centralized Utility:**
- ✅ Change currency in 1 place (not 32 files)
- ✅ Consistent formatting everywhere
- ✅ Easy multi-currency support later
- ✅ Proper decimal handling
- ✅ Professional Intl API usage

**Example future currency switch:**
```typescript
// To switch to EUR:
export const CURRENCY_CONFIG = {
  code: 'EUR',
  symbol: '€',
  locale: 'de-DE',
};
// Done! Entire app now shows EUR
```

---

## Success Criteria

✅ Currency utility created  
✅ All components use centralized formatPrice  
✅ All prices show "$" not "₦"  
✅ All prices show proper USD format ($1,234.56)  
✅ Admin forms say "USD" not "NGN"  
✅ Cart calculations work correctly  
✅ Checkout shows USD amounts  
✅ Orders display in USD  
✅ No linter errors  
✅ No console errors  

---

**Ready to implement!** This will take about 15-20 minutes to update all 32 files systematically.

Shall I proceed with implementation?

