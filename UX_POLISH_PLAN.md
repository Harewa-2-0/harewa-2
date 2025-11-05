# UX Polish Plan: Parallel Fetching + Skeleton Loaders

## Issues Identified

### Issue 1: Sequential Fetching (Waterfall) ⚠️
**Current flow on product detail page:**
```
Product fetch starts (500ms)
  ↓ wait for product...
  ↓ product loads
  ↓ THEN recommendations fetch starts (500ms)
Total: 1000ms
```

**Problem:** User waits 1 second to see recommendations

**Solution:** Parallel fetching
```
Product fetch starts (500ms)     Recommendations fetch starts (500ms)
         ↓                                    ↓
    Both finish together
Total: 500ms (50% faster!)
```

---

### Issue 2: Generic Spinners Instead of Skeletons 🎨

**Current:** Boring spinner (no context)
```
<div className="animate-spin ..."></div>
```

**Better:** Content-aware skeleton (shows expected shape)
```
<div className="animate-pulse">
  <div className="h-64 bg-gray-200"></div> {/* Image placeholder */}
  <div className="h-4 bg-gray-200 rounded"></div> {/* Title */}
  <div className="h-3 bg-gray-200 rounded w-3/4"></div> {/* Price */}
</div>
```

**Why better:**
- ✅ User knows what's coming
- ✅ Feels faster (perceived performance)
- ✅ Professional look (like Shopify, Amazon)
- ✅ Less jarring transition

---

## Optimization Plan

### Part A: Fix Parallel Fetching

**File:** `src/hooks/useProducts.ts`

**Current Issue:**
```typescript
useRecommendedProductsQuery(categoryId, productId, enabled: !!product)
//                                                    ↑
//                           Waits for product to load first
```

**Solution:** Use URL-based fetching
```typescript
// In product page component
const { data: product } = useProductByIdQuery(slug);
const { data: recommendations } = useRecommendedProductsQuery(
  slug, // Pass productId from URL, not from loaded product
  true  // Fetch immediately in parallel
);

// Hook queries product's category from its own data
// Recommendations might load before product (that's OK!)
```

**Alternative (Better):** Fetch by product ID, get category server-side
```typescript
// Add new endpoint: /api/product/{id}/recommendations
// Backend handles category lookup
```

**For now:** Make both queries independent, handle loading states gracefully

---

### Part B: Create Skeleton Components

**1. Create ProductCardSkeleton Component**

**File:** `src/components/common/skeletons/ProductCardSkeleton.tsx` (NEW)

```typescript
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-64 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

// Grid version for product lists
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

**2. Create ProductDetailSkeleton Component**

**File:** `src/components/common/skeletons/ProductDetailSkeleton.tsx` (NEW)

```typescript
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="col-span-7 animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="col-span-5 animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-12 bg-gray-200 rounded mt-6"></div>
            </div>
          </div>
        </div>
        
        {/* Mobile layout skeleton */}
        <div className="lg:hidden animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
```

---

### Part C: Update Components

**1. Product Detail Page**
```typescript
if (isLoading) {
  return <ProductDetailSkeleton />;
}
```

**2. Product Customize Page**
```typescript
if (isLoading) {
  return <ProductDetailSkeleton />;
}
```

**3. Shop Page (Ready To Wear)**
```typescript
if (loading) {
  return <ProductGridSkeleton count={12} />;
}
```

**4. New Arrivals (Home)**
```typescript
if (isLoading) {
  return <ProductGridSkeleton count={5} />;
}
```

**5. Recommended Products**
```typescript
if (isLoading) {
  return <ProductGridSkeleton count={8} />;
}
```

---

## Implementation Steps

### Step 1: Fix Parallel Fetching
- [ ] Update `useRecommendedProductsQuery` to be independent
- [ ] Remove `enabled: !!product` dependency
- [ ] Both queries fetch in parallel
- [ ] Handle case where recommendations load before product

### Step 2: Create Skeleton Components
- [ ] Create `src/components/common/skeletons/ProductCardSkeleton.tsx`
- [ ] Create `src/components/common/skeletons/ProductDetailSkeleton.tsx`
- [ ] Export from index file

### Step 3: Update Product Pages
- [ ] Replace spinner in `/shop/[slug]/page.tsx` with skeleton
- [ ] Replace spinner in `/shop/[slug]/customize/page.tsx` with skeleton
- [ ] Update recommendations to show skeleton

### Step 4: Update Shop Grid
- [ ] Replace spinner in `ProductGrid.tsx` with skeleton grid

### Step 5: Update Homepage
- [ ] Replace loading in `new_Arivals.tsx` with skeleton grid

---

## Testing Per Step

### After Step 1 (Parallel Fetching):
- [ ] Open Network tab
- [ ] Navigate to product page
- [ ] **VERIFY:** Product + Recommendations start AT THE SAME TIME
- [ ] **VERIFY:** Total load time ~500ms (not 1000ms)

### After Steps 2-5 (Skeletons):
- [ ] Clear React Query cache
- [ ] Navigate to product page
- [ ] **EXPECT:** Skeleton layout appears (not spinner)
- [ ] **EXPECT:** Skeleton shows image + text placeholders
- [ ] **EXPECT:** Smooth transition when data loads
- [ ] Repeat for shop page, homepage, customize page

---

## Benefits

### Parallel Fetching:
- ✅ 50% faster page load (1s → 0.5s)
- ✅ Better resource utilization
- ✅ Recommendations visible sooner

### Skeleton Loaders:
- ✅ Better perceived performance
- ✅ User knows what's coming
- ✅ Professional, polished look
- ✅ Less jarring transition
- ✅ Matches modern e-commerce UX standards

---

## Success Criteria

✅ Product + recommendations fetch in parallel  
✅ All loading states use skeleton loaders  
✅ Skeletons match expected content shape  
✅ Smooth transition from skeleton to content  
✅ No layout shift during load  
✅ Professional, polished appearance  

---

**Ready to implement?** This will make the app feel significantly more polished and professional! 🎨

