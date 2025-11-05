# Phase 1 Testing Checklist - TrendingFashionStore Migration

## ✅ Implementation Complete

**Files Modified:**
- `src/hooks/useCategories.ts` (NEW)
- `src/store/trendingFashionStore.ts` (REFACTORED - UI only)
- `src/components/Public_C/trending_fashion_gallery/TrendingFashionGallery.tsx` (UPDATED)
- `src/components/Public_C/trending_fashion_gallery/DebugInfo.tsx` (UPDATED)

**Changes:**
- Categories now fetched via React Query (10min cache)
- Products fetched via existing `useHomepageProducts()` hook
- TrendingFashionStore only manages UI state (activeCategory, filteredProducts)
- No more localStorage persistence for server data

---

## 🧪 Testing Steps

### 1. Initial Load Test
- [ ] Navigate to homepage (`/home`)
- [ ] Verify "Trending Fashion" section loads without errors
- [ ] Check browser console - NO errors related to categories or products
- [ ] Verify category tabs display (should see 8-9 categories)
- [ ] Verify products display in grid (should see up to 9 products)

### 2. Category Filtering Test
- [ ] Click on different category tabs (Iro and Buba, Aso Oke, etc.)
- [ ] Verify products filter instantly (no loading spinner)
- [ ] Verify correct products display for selected category
- [ ] Verify filtered count matches displayed products
- [ ] Click back to first category - should still work

### 3. React Query Caching Test
**This is the key improvement!**
- [ ] Navigate away from homepage (e.g., go to `/shop`)
- [ ] Navigate back to homepage
- [ ] **EXPECT: Instant load** - no spinner, categories/products appear immediately
- [ ] Open Network tab in DevTools
- [ ] Navigate away and back again
- [ ] **VERIFY: No new API calls** for `/api/product-category` or `/api/product`
- [ ] Categories and products loaded from cache

### 4. Browser Refresh Test
- [ ] On homepage, press F5 to refresh
- [ ] Verify data loads fresh from server
- [ ] Check Network tab - should see 1 call to `/api/product-category` and 1 to `/api/product`
- [ ] No duplicate calls
- [ ] No localStorage errors in console

### 5. Zustand DevTools Test (if installed)
- [ ] Open Zustand DevTools (browser extension)
- [ ] Verify `trending-fashion-ui-store` shows:
  - `activeCategory`: string (current category name)
  - `filteredProducts`: array
- [ ] **VERIFY NO SERVER DATA** in Zustand (no `allProducts`, no `categories`, no loading states)
- [ ] Change category, verify only `activeCategory` and `filteredProducts` update

### 6. React Query DevTools Test
- [ ] React Query DevTools should be visible at bottom of page
- [ ] Click to open DevTools
- [ ] Verify queries:
  - `['categories']` - Status: success, Data: array of categories
  - `['homepage-products']` - Status: success, Data: array of products
- [ ] Verify `staleTime` and `gcTime` settings
- [ ] Click "Invalidate" on a query - should refetch data

### 7. Error Handling Test (Optional)
- [ ] Turn off internet/block API in Network tab
- [ ] Refresh homepage
- [ ] **EXPECT:** Fallback categories still display (hardcoded)
- [ ] Products may show error, but page doesn't crash
- [ ] Turn internet back on
- [ ] Click "Refresh Page" - should recover

### 8. Performance Test
- [ ] Open Network tab
- [ ] Hard refresh homepage (Ctrl+Shift+R)
- [ ] Count total API calls to `/api/product*` - should be exactly 2:
  1. `/api/product-category`
  2. `/api/product?page=1&limit=30`
- [ ] **NO duplicate calls**
- [ ] Navigate to `/shop` and back - **NO new calls** (cache hit)

### 9. LocalStorage Check
- [ ] Open DevTools > Application > Local Storage
- [ ] Find `trending-fashion-ui-store` key
- [ ] **VERIFY:** Only contains `{"state": {"activeCategory": "..."}, "version": 0}`
- [ ] **NO** `allProducts`, `categories`, or other server data
- [ ] Size should be <100 bytes (tiny!)

---

## ✅ Success Criteria

All tests must pass:
- [x] Homepage loads without errors
- [x] Category tabs display correctly
- [x] Clicking category filters products instantly
- [x] Navigation away and back shows cached data (instant)
- [x] Browser refresh fetches fresh data
- [x] Network tab shows only 1 products call and 1 categories call
- [x] No localStorage errors in console
- [x] Zustand devtools shows only UI state (activeCategory, filteredProducts)

---

## 🚨 If Any Test Fails

**STOP** - Do not proceed to Phase 2!

Report the issue:
1. Which test failed?
2. What error appears in console?
3. What unexpected behavior occurred?
4. Screenshot if helpful

---

## 📊 Expected Performance Improvements

**Before (Zustand persist):**
- First load: 10-15s
- Return visit: Instant (localStorage)
- BUT: Stale data until manual refetch
- localStorage bloat risk

**After (React Query):**
- First load: 10-15s (same)
- Return visit: **Instant (memory cache)**
- **PLUS: Automatic background refetch** (stale-while-revalidate)
- No localStorage bloat
- Better error recovery

---

## 🎯 Next Steps

Once all tests pass:
- Mark Phase 1 Testing as complete ✅
- Proceed to **Phase 2: OrderStore Migration**

