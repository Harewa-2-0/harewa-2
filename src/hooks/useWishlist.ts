// src/hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleWishlist, getMyWishlist, type WishlistProduct } from '@/services/wishlist';
import { useAuthStore } from '@/store/authStore';

/** Query Keys */
export const wishlistKeys = {
  all: ['wishlist'] as const,
  mine: () => [...wishlistKeys.all, 'mine'] as const,
};

/**
 * Hook to fetch user's wishlist
 * Cached for 5 minutes
 */
export function useWishlistQuery(enabled: boolean = true) {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<WishlistProduct[], Error>({
    queryKey: wishlistKeys.mine(),
    queryFn: async () => {
      return await getMyWishlist();
    },
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to check if a product is in wishlist
 * Derived from wishlist query (no separate API call)
 */
export function useIsInWishlist(productId: string | undefined) {
  const { data: wishlist = [] } = useWishlistQuery();
  if (!productId) return false;
  
  // Ensure wishlist is an array before calling .some()
  if (!Array.isArray(wishlist)) {
    console.warn('[useIsInWishlist] Wishlist data is not an array:', wishlist);
    return false;
  }
  
  return wishlist.some(product => product._id === productId);
}

/**
 * Mutation to toggle product in wishlist
 * Includes optimistic updates
 */
export function useToggleWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { added: boolean; message: string },
    Error,
    { productId: string }
  >({
    mutationFn: async ({ productId }) => {
      const result = await toggleWishlist(productId);
      return { added: result.added, message: result.message };
    },
    onMutate: async ({ productId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: wishlistKeys.mine() });

      // Snapshot previous value
      const previousWishlist = queryClient.getQueryData<WishlistProduct[]>(wishlistKeys.mine());

      // Optimistically update
      queryClient.setQueryData<WishlistProduct[]>(wishlistKeys.mine(), (old = []) => {
        const exists = old.some(p => p._id === productId);
        if (exists) {
          // Remove from wishlist
          return old.filter(p => p._id !== productId);
        } else {
          // Add to wishlist (we don't have full product data yet)
          // The refetch will get full data
          return [...old, { _id: productId } as WishlistProduct];
        }
      });

      return { previousWishlist };
    },
    onError: (err, variables, context) => {
      console.error('Failed to toggle wishlist:', err);
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistKeys.mine(), context.previousWishlist);
      }
    },
    onSuccess: () => {
      // Refetch to get full product data
      queryClient.invalidateQueries({ queryKey: wishlistKeys.mine() });
    },
  });
}
