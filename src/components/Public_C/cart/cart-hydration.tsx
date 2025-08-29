"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { CartErrorBoundary } from './cart-error-boundary';

/**
 * Cart Hydration Component
 * 
 * This component automatically hydrates the cart state when:
 * 1. User logs in (isAuthenticated changes from false to true)
 * 2. Component mounts and user is already authenticated
 * 
 * It ensures the cart badge and drawer always show the correct data
 * from the server without requiring user interaction.
 */
export function CartHydration() {
  const { isAuthenticated, hasHydratedAuth } = useAuthStore();
  const { 
    ensureHydrated, 
    clearCart, 
    syncGuestCartToServer, 
    isGuestCart,
    items 
  } = useCartStore();
  const [retryCount, setRetryCount] = useState(0);
  const [hasSyncedGuestCart, setHasSyncedGuestCart] = useState(false);

  useEffect(() => {
    // Only run after auth has hydrated
    if (!hasHydratedAuth) return;

    if (isAuthenticated) {
      // User is logged in
      if (isGuestCart && items.length > 0 && !hasSyncedGuestCart) {
        // User has guest cart items - sync them to server first
        syncGuestCartToServer().then(() => {
          setHasSyncedGuestCart(true);
          // After syncing guest cart, ensure cart is hydrated (force: false for TTL)
          ensureHydrated(false).catch((error) => {
            console.error('Failed to hydrate cart after guest cart sync:', error);
          });
        }).catch((error) => {
          console.error('Failed to sync guest cart:', error);
          // Even if sync fails, try to hydrate cart (force: false for TTL)
          ensureHydrated(false).catch(console.error);
        });
      } else if (!isGuestCart) {
        // No guest cart items or already synced - hydrate cart normally (force: false for TTL)
        // OPTIMIZATION: Only hydrate if not recently synced
        const lastSynced = useCartStore.getState().lastSyncedAt;
        const now = Date.now();
        
        if (!lastSynced || (now - lastSynced) > 60000) { // 1 minute threshold
          ensureHydrated(false).catch((error) => {
            console.error('Failed to hydrate cart during hydration:', error);
            
            // If it's an auth error, try to refresh token and retry once
            if (error.message?.includes('expired') || error.message?.includes('jwt expired')) {
              setTimeout(() => {
                if (retryCount < 1) {
                  setRetryCount(prev => prev + 1);
                  ensureHydrated(false).catch(console.error);
                }
              }, 2000); // Wait 2 seconds before retry
            }
          });
        }
      }
    } else {
      // User is not logged in - DON'T clear cart, just reset flags
      setRetryCount(0);
      setHasSyncedGuestCart(false);
      // Don't call clearCart() here - it will clear guest items!
    }
  }, [hasHydratedAuth, isAuthenticated, ensureHydrated, clearCart, retryCount, isGuestCart, items.length, hasSyncedGuestCart, syncGuestCartToServer]);

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
