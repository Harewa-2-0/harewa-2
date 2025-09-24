"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCartDrawerStore } from '@/store/cartDrawerStore';
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
    fetchCart, 
    syncToServer, 
    isGuestCart,
    items 
  } = useCartStore();
  const { isOpen: isCartDrawerOpen } = useCartDrawerStore();
  const [retryCount, setRetryCount] = useState(0);
  const [hasSyncedGuestCart, setHasSyncedGuestCart] = useState(false);

  useEffect(() => {
    // Only run after auth has hydrated
    if (!hasHydratedAuth) {
      return;
    }

    // Don't fetch cart if cart drawer is open to prevent GET request before DELETE
    if (isCartDrawerOpen) {
      return;
    }

    if (isAuthenticated) {
      // User is logged in - fetch cart from server
      // Only fetch if we don't have items (initial load or after logout)
      if (items.length === 0) {
        fetchCart().catch((error) => {
          console.error('Failed to fetch cart during hydration:', error);
          
          // If it's an auth error, try to retry once
          if (error.message?.includes('expired') || error.message?.includes('jwt expired')) {
            setTimeout(() => {
              if (retryCount < 1) {
                setRetryCount(prev => prev + 1);
                fetchCart().catch(console.error);
              }
            }, 2000); // Wait 2 seconds before retry
          }
        });
      }
    } else {
      // User is not logged in - reset flags
      setRetryCount(0);
      setHasSyncedGuestCart(false);
    }
  }, [hasHydratedAuth, isAuthenticated, fetchCart, retryCount, items.length, isCartDrawerOpen]);

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
