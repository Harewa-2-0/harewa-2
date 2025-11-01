"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCartDrawerStore } from '@/store/cartDrawerStore';
import { useCartQuery, useCartRawQuery, useReplaceCartMutation, cartKeys } from '@/hooks/useCart';
import { addLinesToMyCart, deduplicateCartItems } from '@/services/cart';
import { useQueryClient } from '@tanstack/react-query';
import { CartErrorBoundary } from './cart-error-boundary';

/**
 * Cart Hydration Component (React Query Version)
 * 
 * Automatically syncs cart when user authenticates:
 * 1. Merges guest cart with server cart on login
 * 2. Loads server cart for authenticated users
 * 3. Handles guest cart for non-authenticated users
 */
export function CartHydration() {
  const { isAuthenticated, hasHydratedAuth, user } = useAuthStore();
  const { 
    items: localItems,
    getGuestCart,
    clearGuestCart,
    setItems,
    setCartId,
    setIsGuestCart,
  } = useCartStore();
  const { isOpen: isCartDrawerOpen } = useCartDrawerStore();
  
  const queryClient = useQueryClient();
  const previousAuthStateRef = useRef(isAuthenticated);
  const hasMergedRef = useRef(false);

  // Fetch server cart for authenticated users (React Query handles caching)
  const { data: serverCartItems = [], isLoading } = useCartQuery(
    isAuthenticated && hasHydratedAuth && !isCartDrawerOpen
  );

  // Also fetch the raw cart to get cartId
  const { data: rawCart } = useCartRawQuery(
    isAuthenticated && hasHydratedAuth && !isCartDrawerOpen
  );

  const replaceCartMutation = useReplaceCartMutation();

  // Sync server cart to local store for UI (including cartId!)
  useEffect(() => {
    if (isAuthenticated && rawCart) {
      const cartId = (rawCart as any)._id || (rawCart as any).id;
      setCartId(cartId);
      setItems(serverCartItems);
      setIsGuestCart(false);
    }
  }, [rawCart, serverCartItems, isAuthenticated, setCartId, setItems, setIsGuestCart]);

  // Handle login: merge guest cart with server cart
  useEffect(() => {
    if (!hasHydratedAuth) return;

    const justLoggedIn = !previousAuthStateRef.current && isAuthenticated;
    
    if (justLoggedIn && !hasMergedRef.current) {
      hasMergedRef.current = true;
      
      const guestCart = getGuestCart();
      
      if (guestCart.length > 0) {
        console.log('[CartHydration] Merging guest cart with server cart...');
        
        // Merge guest items with server items
        const merged = deduplicateCartItems([...serverCartItems, ...guestCart]);
        
        // If there's a difference, sync to server
        if (merged.length > serverCartItems.length || 
            !merged.every((item, i) => serverCartItems[i]?.id === item.id)) {
          
          addLinesToMyCart(merged.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          }))).then(() => {
            // Refetch cart after merge
            queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
            // Clear guest cart after successful merge
            clearGuestCart();
            console.log('[CartHydration] Guest cart merged successfully');
          }).catch((error) => {
            console.error('[CartHydration] Failed to merge guest cart:', error);
          });
        } else {
          // No merge needed, just clear guest cart
          clearGuestCart();
        }
      }
      
      // Update local state
      setIsGuestCart(false);
    }

    // Handle logout: switch to guest mode
    if (previousAuthStateRef.current && !isAuthenticated) {
      hasMergedRef.current = false;
      setIsGuestCart(true);
      setCartId(null);
      
      // Load guest cart from localStorage
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        setItems(guestCart);
      }
    }
    
    previousAuthStateRef.current = isAuthenticated;
  }, [
    hasHydratedAuth, 
    isAuthenticated, 
    serverCartItems, 
    getGuestCart, 
    clearGuestCart, 
    setIsGuestCart, 
    setCartId, 
    setItems,
    queryClient
  ]);

  // Load guest cart on mount (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated && hasHydratedAuth) {
      const guestCart = getGuestCart();
      if (guestCart.length > 0 && localItems.length === 0) {
        setItems(guestCart);
      }
    }
  }, [isAuthenticated, hasHydratedAuth, getGuestCart, setItems, localItems.length]);

  // This component doesn't render anything
  return null;
}

/**
 * Wrapper component that provides error boundary for cart-related operations
 */
export function CartHydrationWithErrorBoundary() {
  return (
    <CartErrorBoundary>
      <CartHydration />
    </CartErrorBoundary>
  );
}