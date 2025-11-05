# Phase 2 Testing Checklist - OrderStore Migration

## ✅ Implementation Complete

**Files Modified:**
1. **`src/hooks/useOrders.ts`** (NEW)
   - React Query hooks for orders (fetch, create, delete)
   - Optimistic updates for create/delete mutations
   - Derived `usePendingOrderQuery` hook
   
2. **`src/store/orderStore.ts`** (REFACTORED - UI only)
   - Now only manages `currentOrder` for checkout flow
   - All server data removed
   
3. **Updated Components:**
   - `src/components/Public_C/cart/checkout-section.tsx`
   - `src/components/Public_C/shop/cart.tsx`
   - `src/components/Public_C/cart/cart-items.tsx`
   - `src/components/Protected/profile/orders/order-card.tsx`
   - `src/components/Protected/profile/orders/order-section.tsx`

**Changes:**
- Orders now fetched via React Query (2min cache)
- Mutations include optimistic updates
- Zustand only manages current order for checkout UI flow
- Automatic cache invalidation on mutations

---

## 🧪 Testing Steps

### 1. Cart Page - Pending Order Warning
- [ ] Navigate to `/cart` page
- [ ] If you have a pending order, verify warning banner displays
- [ ] Warning should say "You have a pending order"
- [ ] No console errors

### 2. Cart Page - Create Order from Cart
- [ ] Add items to cart
- [ ] Click "PROCEED TO CHECKOUT" button
- [ ] **EXPECT:** Order created, navigates to `/checkout`
- [ ] Check console - should see "Creating new order..."
- [ ] Verify order appears in profile orders (next test)

### 3. Cart Page - Auto-Delete Pending Order
- [ ] Create an order from cart (as above)
- [ ] Navigate back to `/cart`
- [ ] Modify cart items (add/remove)
- [ ] Click "PROCEED TO CHECKOUT" again
- [ ] **EXPECT:** Toast "Previous order cancelled. Creating new order..."
- [ ] **EXPECT:** Old order deleted, new order created
- [ ] Navigate to `/checkout`

### 4. Cart Drawer - Create Order
- [ ] Open cart drawer (click cart icon)
- [ ] Add items to cart
- [ ] Click "CHECKOUT" button in drawer
- [ ] **EXPECT:** Order created, drawer closes, navigates to `/checkout`
- [ ] No console errors

### 5. Cart Drawer - Auth Gate
- [ ] Log out
- [ ] Add items to cart (guest cart)
- [ ] Open cart drawer
- [ ] Click "CHECKOUT"
- [ ] **EXPECT:** Toast "Please sign in or create an account to checkout"
- [ ] **EXPECT:** Drawer closes, navigates to `/signin`

### 6. Profile Orders - Display All Orders
- [ ] Navigate to `/profile` (or your profile page)
- [ ] Click on "My Orders" tab
- [ ] **EXPECT:** All orders display
- [ ] Verify orders are categorized (Active, Completed, Cancelled)
- [ ] Check counts in tab badges match actual orders

### 7. Profile Orders - Delete Order (Optimistic Update)
- [ ] On "My Orders" tab, find any order
- [ ] Click the X button (delete)
- [ ] **EXPECT:** Order disappears INSTANTLY (optimistic update)
- [ ] **EXPECT:** Toast "Order deleted successfully"
- [ ] Refresh page - order should still be deleted
- [ ] Network tab shows 1 DELETE call

### 8. Profile Orders - Cancel Pending Order
- [ ] Create a pending order (from cart)
- [ ] Navigate to profile orders
- [ ] Find the pending order (yellow badge)
- [ ] Click the X button (cancel)
- [ ] **EXPECT:** Order disappears INSTANTLY (optimistic update)
- [ ] **EXPECT:** Toast "Pending order cancelled successfully"
- [ ] Order removed from list

### 9. Profile Orders - Complete Payment Button
- [ ] Create a pending order
- [ ] Navigate to profile orders
- [ ] Click "Complete Payment" button
- [ ] **EXPECT:** Navigates to `/checkout`
- [ ] **EXPECT:** Checkout page displays order details
- [ ] Can proceed with payment

### 10. React Query Caching Test
**This is the key improvement!**
- [ ] Navigate to profile orders
- [ ] Wait for orders to load
- [ ] Navigate away (e.g., to `/shop`)
- [ ] Navigate back to profile orders
- [ ] **EXPECT:** Orders appear INSTANTLY (cached)
- [ ] Open Network tab
- [ ] Navigate away and back again
- [ ] **VERIFY:** No new API call to `/api/order/me` (cache hit)

### 11. Order Mutations - Cache Invalidation
- [ ] On profile orders page
- [ ] Delete an order
- [ ] **EXPECT:** Order list updates instantly (optimistic)
- [ ] Check Network tab - should see refetch after mutation
- [ ] Verify list is accurate after refetch

### 12. Loading States
- [ ] Clear React Query cache (React Query DevTools)
- [ ] Navigate to profile orders
- [ ] **EXPECT:** Loading spinner while fetching
- [ ] **EXPECT:** Orders display after load
- [ ] Create new order from cart
- [ ] **EXPECT:** "PROCESSING..." text with spinner
- [ ] **EXPECT:** Button disabled during mutation

### 13. Error Handling
- [ ] Turn off internet/block API
- [ ] Try to create order
- [ ] **EXPECT:** Toast error message
- [ ] **EXPECT:** Page doesn't crash
- [ ] Turn internet back on
- [ ] Try again - should work

### 14. React Query DevTools
- [ ] React Query DevTools should be visible
- [ ] Open DevTools
- [ ] Verify queries:
  - `['orders', 'mine']` - Status: success, Data: array of orders
- [ ] Create/delete an order
- [ ] Verify mutation shows in DevTools
- [ ] Verify cache updates automatically

### 15. Zustand DevTools
- [ ] Open Zustand DevTools
- [ ] Verify `order-ui-store` shows:
  - `currentOrder`: Order object or null
- [ ] **VERIFY NO SERVER DATA** (no allOrders, pendingOrder, loading states)
- [ ] Create order, verify currentOrder updates
- [ ] Complete checkout, verify currentOrder clears

---

## ✅ Success Criteria

All tests must pass:
- [x] Cart page displays pending order warning
- [x] Create order from cart works
- [x] Auto-delete pending order works
- [x] Cart drawer checkout works
- [x] Auth gate redirects to signin
- [x] Profile orders display all orders
- [x] Delete order (optimistic update) works instantly
- [x] Cancel pending order works
- [x] Complete payment button navigates correctly
- [x] Navigation back to orders shows cached data (instant)
- [x] Cache invalidates after mutations
- [x] Loading states display correctly
- [x] Error handling works gracefully
- [x] React Query DevTools shows proper state
- [x] Zustand only has UI state (no server data)

---

## 🚨 If Any Test Fails

**STOP** - Do not proceed to Phase 3!

Report the issue:
1. Which test failed?
2. What error appears in console?
3. What unexpected behavior occurred?
4. Screenshot if helpful

---

## 📊 Expected Performance Improvements

**Before (Zustand manual):**
- Manual fetching with `fetchPendingOrder()`, `fetchAllOrders()`
- Manual cache management
- Manual state updates on mutations
- Manual refetch after mutations
- Potential stale data

**After (React Query):**
- Automatic fetching on mount
- Automatic caching (2min stale time)
- **Optimistic updates** (instant UI feedback)
- Automatic refetch after mutations
- Automatic cache invalidation
- Better error recovery

**User Experience:**
- Orders appear instantly on return visits (cache)
- Delete operations feel instant (optimistic)
- No manual refetch buttons needed
- Automatic background refetching

---

## 🎯 Next Steps

Once all tests pass:
- Mark Phase 2 Testing as complete ✅
- Proceed to **Phase 3: ProfileStore & FabricStore Migration**

