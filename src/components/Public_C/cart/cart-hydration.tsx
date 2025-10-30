"use client";

import { useEffect, useState, useRef } from 'react';
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
    isMerging,
    isRefreshing
  } = useCartStore();
  const { isOpen: isCartDrawerOpen } = useCartDrawerStore();
  
  const [retryCount, setRetryCount] = useState(0);
  const hasInitiallyFetchedRef = useRef(false);
  const previousAuthStateRef = useRef(isAuthenticated);

  useEffect(() => {
    // Only run after auth has hydrated
    if (!hasHydratedAuth) {
      return;
    }

    // Don't fetch cart if cart drawer is open to prevent GET request before DELETE
    if (isCartDrawerOpen) {
      return;
    }

    // Don't fetch cart if merge or refresh is in progress to prevent race conditions
    // The merge process handles cart fetching during login, so we should not interfere
    if (isMerging || isRefreshing) {
      return;
    }

    if (isAuthenticated) {
      // Only fetch on initial load or when user just logged in
      const justLoggedIn = !previousAuthStateRef.current && isAuthenticated;
      
      if (!hasInitiallyFetchedRef.current || justLoggedIn) {
        hasInitiallyFetchedRef.current = true;
        
        fetchCart().catch((error) => {
          console.error('Failed to fetch cart during hydration:', error);
          
          // If it's an auth error, try to retry once
          const isAuthError = error.message?.includes('expired') || 
                             error.message?.includes('jwt expired') ||
                             error.status === 401;
          
          if (isAuthError && retryCount < 1) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchCart().catch(console.error);
            }, 2000); // Wait 2 seconds before retry
          }
        });
      }
    } else {
      // User is not logged in - reset flags
      setRetryCount(0);
      hasInitiallyFetchedRef.current = false;
    }
    
    // Update previous auth state
    previousAuthStateRef.current = isAuthenticated;
  }, [hasHydratedAuth, isAuthenticated, fetchCart, retryCount, isCartDrawerOpen, isMerging, isRefreshing]);

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