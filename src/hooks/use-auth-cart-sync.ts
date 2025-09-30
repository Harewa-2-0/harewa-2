import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

/**
 * Hook to synchronize cart store with authentication state changes
 * Automatically clears cart when user logs out
 */
export function useAuthCartSync() {
  const { isAuthenticated, hasHydratedAuth } = useAuthStore();
  const { handleAuthStateChange } = useCartStore();
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    // Track auth state changes
    const authStateChanged = previousAuthState !== null && previousAuthState !== isAuthenticated;
    setPreviousAuthState(isAuthenticated);
    
    // Only run after auth has hydrated AND auth state actually changed
    if (hasHydratedAuth && authStateChanged) {
      handleAuthStateChange(isAuthenticated);
    }
  }, [isAuthenticated, hasHydratedAuth, handleAuthStateChange, previousAuthState]);
}
