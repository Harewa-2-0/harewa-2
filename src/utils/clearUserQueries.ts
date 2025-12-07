// Utility function to clear user-specific React Query caches
import { QueryClient } from '@tanstack/react-query';

/**
 * Clears all user-specific React Query caches
 * Should be called before logout to ensure clean state
 */
export function clearUserQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['profile'] });
  queryClient.removeQueries({ queryKey: ['cart'] });
  queryClient.removeQueries({ queryKey: ['orders'] });
  queryClient.removeQueries({ queryKey: ['wishlist'] });
}

