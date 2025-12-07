'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useCartStore, type CartLine, type SizeBreakdown } from '@/store/cartStore';
import { useCartQuery, useCartRawQuery, cartKeys } from '@/hooks/useCart';
import { getMyCart, mapServerCartToStoreItems } from '@/services/cart';

/**
 * Merges server cart items with local sizeBreakdown data
 * Server doesn't store sizeBreakdown/productNote correctly, so we preserve local data
 */
function mergeWithLocalSizeData(serverItems: CartLine[], localItems: CartLine[]): CartLine[] {
  return serverItems.map(serverItem => {
    const localItem = localItems.find(local => local.id === serverItem.id);
    
    // Check if local has meaningful sizeBreakdown data
    const localHasSizeData = localItem?.sizeBreakdown && 
      Object.keys(localItem.sizeBreakdown).length > 0 &&
      Object.values(localItem.sizeBreakdown).some(qty => qty > 0);
    
    // Check if server has meaningful sizeBreakdown data
    const serverHasSizeData = serverItem.sizeBreakdown && 
      Object.keys(serverItem.sizeBreakdown).length > 0 &&
      Object.values(serverItem.sizeBreakdown).some(qty => qty > 0);
    
    return {
      ...serverItem,
      // Preserve local metadata if server doesn't have it
      name: serverItem.name || localItem?.name,
      image: serverItem.image || localItem?.image,
      price: serverItem.price ?? localItem?.price,
      // CRITICAL: Prefer local sizeBreakdown since server doesn't store it
      sizeBreakdown: localHasSizeData ? localItem!.sizeBreakdown : 
                     serverHasSizeData ? serverItem.sizeBreakdown : 
                     localItem?.sizeBreakdown,
      productNote: localItem?.productNote || serverItem.productNote,
      // Merge available sizes
      availableSizes: serverItem.availableSizes?.length 
        ? serverItem.availableSizes 
        : localItem?.availableSizes || [],
    };
  });
}

/**
 * Hook to automatically sync React Query cart data to Zustand store
 * 
 * For authenticated users:
 * - React Query is the source of truth for server data
 * - Zustand mirrors it for UI components to consume
 * - Local sizeBreakdown data is preserved since server doesn't store it
 * 
 * For guest users:
 * - Zustand + localStorage is the source of truth
 * - This hook does nothing
 */
export function useCartSync() {
  const { isAuthenticated, hasHydratedAuth } = useAuthStore();
  const { 
    items: localItems, 
    setItems, 
    setCartId, 
    setIsGuestCart,
    isMerging,
  } = useCartStore();
  
  const lastSyncRef = useRef<string>('');
  
  // Only fetch for authenticated users (React Query handles caching)
  const { data: serverItems, isLoading, dataUpdatedAt } = useCartQuery(
    isAuthenticated && hasHydratedAuth
  );
  
  const { data: rawCart } = useCartRawQuery(
    isAuthenticated && hasHydratedAuth
  );
  
  // Sync server data to Zustand when it changes
  useEffect(() => {
    // Skip if not authenticated or auth hasn't hydrated
    if (!isAuthenticated || !hasHydratedAuth) return;
    
    // Skip during merge operations (handled by CartHydration)
    if (isMerging) return;
    
    // Skip if no server data yet
    if (!serverItems || serverItems.length === 0) return;
    
    // Skip if data hasn't changed (prevent unnecessary re-renders)
    const syncKey = `${dataUpdatedAt}-${serverItems.map(i => `${i.id}:${i.quantity}`).join(',')}`;
    if (syncKey === lastSyncRef.current) return;
    lastSyncRef.current = syncKey;
    
    // Merge server items with local sizeBreakdown data
    const mergedItems = mergeWithLocalSizeData(serverItems, localItems);
    
    // Update Zustand store
    setItems(mergedItems);
    setIsGuestCart(false);
    
    // Update cartId if available
    if (rawCart) {
      const cartId = (rawCart as any)._id || (rawCart as any).id;
      if (cartId) {
        setCartId(cartId);
      }
    }
  }, [
    isAuthenticated, 
    hasHydratedAuth, 
    serverItems, 
    rawCart, 
    dataUpdatedAt,
    isMerging,
    localItems,
    setItems, 
    setCartId, 
    setIsGuestCart,
  ]);
  
  return {
    isLoading,
    isSyncing: isLoading && isAuthenticated,
  };
}

/**
 * Hook to prefetch cart data (call on hover/focus)
 * Warms up React Query cache before the cart drawer opens
 */
export function usePrefetchCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  
  const prefetch = () => {
    if (!isAuthenticated) return;
    
    // Prefetch with shorter stale time for responsive UX
    queryClient.prefetchQuery({
      queryKey: cartKeys.mine(),
      queryFn: async () => {
        const cart = await getMyCart();
        if (!cart) return [];
        return mapServerCartToStoreItems(cart);
      },
      staleTime: 30 * 1000, // 30 seconds
    });
  };
  
  return { prefetch };
}

/**
 * Combined hook for components that need both sync and prefetch
 */
export function useCartWithSync() {
  const sync = useCartSync();
  const { prefetch } = usePrefetchCart();
  
  return {
    ...sync,
    prefetch,
  };
}

