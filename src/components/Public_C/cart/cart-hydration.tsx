"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCartDrawerStore } from '@/store/cartDrawerStore';
import { useCartQuery, useCartRawQuery, useReplaceCartMutation, cartKeys } from '@/hooks/useCart';
import { addLinesToMyCart, deduplicateCartItems } from '@/services/cart';
import { useQueryClient } from '@tanstack/react-query';
import { CartErrorBoundary } from './cart-error-boundary';
import { useCartSync } from '@/hooks/useCartSync';

/**
 * Cart Hydration Component (React Query Version)
 * 
 * Automatically syncs cart when user authenticates:
 * 1. Merges guest cart with server cart on login
 * 2. Loads server cart for authenticated users
 * 3. Handles guest cart for non-authenticated users
 */
export function CartHydration() {
  // Use the cart sync hook to keep Zustand in sync with React Query
  useCartSync();
  
  const { isAuthenticated, hasHydratedAuth, user } = useAuthStore();
  const { 
    items: localItems,
    getGuestCart,
    clearGuestCart,
    setItems,
    setCartId,
    setIsGuestCart,
    setIsMerging,
    isMerging,
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
  // Skip sync when merge is in progress to prevent overwriting merged cart
  // IMPORTANT: Preserve local sizeBreakdown since server doesn't store it
  useEffect(() => {
    if (isMerging) {
      // Don't sync during merge - merge effect handles the update
      return;
    }
    
    if (isAuthenticated && rawCart) {
      const cartId = (rawCart as any)._id || (rawCart as any).id;
      setCartId(cartId);
      
      // Get current local items to preserve sizeBreakdown
      const currentLocalItems = useCartStore.getState().items;
      
      // Merge server items with local sizeBreakdown data
      const mergedItems = serverCartItems.map(serverItem => {
        const localItem = currentLocalItems.find(local => local.id === serverItem.id);
        
        // Check if local has meaningful sizeBreakdown
        const localHasSizeBreakdown = localItem?.sizeBreakdown && 
          Object.keys(localItem.sizeBreakdown).length > 0 &&
          Object.values(localItem.sizeBreakdown).some(qty => qty > 0);
        
        // Check if server has meaningful sizeBreakdown  
        const serverHasSizeBreakdown = serverItem.sizeBreakdown && 
          Object.keys(serverItem.sizeBreakdown).length > 0 &&
          Object.values(serverItem.sizeBreakdown).some(qty => qty > 0);
        
        return {
          ...serverItem,
          // Preserve local metadata
          name: serverItem.name || localItem?.name,
          image: serverItem.image || localItem?.image,
          price: serverItem.price ?? localItem?.price,
          // CRITICAL: Prefer local sizeBreakdown since server doesn't store it
          sizeBreakdown: localHasSizeBreakdown ? localItem!.sizeBreakdown : 
                         serverHasSizeBreakdown ? serverItem.sizeBreakdown : 
                         localItem?.sizeBreakdown,
          productNote: localItem?.productNote || serverItem.productNote,
          availableSizes: serverItem.availableSizes?.length 
            ? serverItem.availableSizes 
            : localItem?.availableSizes || [],
        };
      });
      
      setItems(mergedItems);
      setIsGuestCart(false);
    }
  }, [rawCart, serverCartItems, isAuthenticated, setCartId, setItems, setIsGuestCart, isMerging]);

  // Handle login: merge guest cart with server cart
  useEffect(() => {
    if (!hasHydratedAuth) return;

    const justLoggedIn = !previousAuthStateRef.current && isAuthenticated;
    
    if (justLoggedIn && !hasMergedRef.current) {
      hasMergedRef.current = true;
      
      const guestCart = getGuestCart();
      
      if (guestCart.length > 0) {
        console.log('[CartHydration] Merging guest cart with server cart...');
        
        // Set merging flag to prevent sync effect from overwriting
        setIsMerging(true);
        
        // Merge guest items with server items
        const merged = deduplicateCartItems([...serverCartItems, ...guestCart]);
        
        // Optimistically update Zustand immediately with merged cart
        setItems(merged);
        setIsGuestCart(false);
        
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
            
            // Clear merging flag after a delay to allow React Query to refetch
            setTimeout(() => {
              setIsMerging(false);
            }, 500);
          }).catch((error) => {
            console.error('[CartHydration] Failed to merge guest cart:', error);
            // Clear merging flag on error so sync can resume
            setIsMerging(false);
          });
        } else {
          // No merge needed, just clear guest cart
          clearGuestCart();
          setIsMerging(false);
        }
      } else {
        // No guest cart, just update state
        setIsGuestCart(false);
      }
    }

    // Handle logout: switch to guest mode
    if (previousAuthStateRef.current && !isAuthenticated) {
      hasMergedRef.current = false;
      setIsMerging(false);
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
    setIsMerging,
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