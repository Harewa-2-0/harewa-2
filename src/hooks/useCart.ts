// React Query hooks for cart operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyCart, 
  addToMyCart, 
  removeProductFromCartById,
  updateProductQuantityOptimistic,
  replaceCartProducts,
  mapServerCartToStoreItems,
  createNewEmptyCart,
  type Cart
} from '@/services/cart';
import type { CartLine } from '@/store/cartStore';

/**
 * Query key factory for cart queries
 */
export const cartKeys = {
  all: ['cart'] as const,
  mine: () => [...cartKeys.all, 'me'] as const,
  byId: (id: string) => [...cartKeys.all, id] as const,
};

/**
 * Hook to fetch the current user's cart
 * Cached with React Query, no localStorage needed for logged-in users
 */
export function useCartQuery(enabled: boolean = true) {
  return useQuery<CartLine[], Error>({
    queryKey: cartKeys.mine(),
    queryFn: async () => {
      const cart = await getMyCart();
      if (!cart) return [];
      
      const items = mapServerCartToStoreItems(cart);
      return items;
    },
    enabled, // Only run if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes (cart data changes frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on every focus
    retry: 1, // Retry once on failure
  });
}

/**
 * Hook to get the raw cart object (with cartId)
 */
export function useCartRawQuery(enabled: boolean = true) {
  return useQuery<Cart | null, Error>({
    queryKey: [...cartKeys.mine(), 'raw'],
    queryFn: async () => {
      return await getMyCart();
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Mutation to add item to cart
 * Automatically refetches cart on success
 */
export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, { productId: string; quantity?: number; price?: number; productNote?: string }>({
    mutationFn: async ({ productId, quantity, price, productNote }) => {
      return await addToMyCart({ productId, quantity, price, productNote });
    },
    onSuccess: () => {
      // Invalidate and refetch cart
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });
}

/**
 * Type for mutation context (used for optimistic updates rollback)
 */
type CartMutationContext = {
  previousCart: CartLine[] | undefined;
};

/**
 * Mutation to update cart item quantity
 * Uses optimistic updates for instant UI
 */
export function useUpdateCartQuantityMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Cart,
    Error,
    { cartId: string; productId: string; quantity: number; currentItems: CartLine[] },
    CartMutationContext
  >({
    mutationFn: async ({ cartId, productId, quantity, currentItems }) => {
      return await updateProductQuantityOptimistic(cartId, productId, quantity, currentItems);
    },
    // Optimistic update - update UI immediately
    onMutate: async ({ productId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() });

      // Snapshot current value
      const previousCart = queryClient.getQueryData<CartLine[]>(cartKeys.mine());

      // Optimistically update
      queryClient.setQueryData<CartLine[]>(cartKeys.mine(), (old) => {
        if (!old) return [];
        
        if (quantity <= 0) {
          return old.filter(item => item.id !== productId);
        }
        
        return old.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
      });

      return { previousCart };
    },
    // On error, rollback
    onError: (err, variables, context: CartMutationContext | undefined) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.mine(), context.previousCart);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
  });
}

/**
 * Mutation to remove item from cart
 */
export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Cart,
    Error,
    { cartId: string; productId: string },
    CartMutationContext
  >({
    mutationFn: async ({ cartId, productId }) => {
      return await removeProductFromCartById(cartId, productId);
    },
    // Optimistic update
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() });
      const previousCart = queryClient.getQueryData<CartLine[]>(cartKeys.mine());

      queryClient.setQueryData<CartLine[]>(cartKeys.mine(), (old) => {
        if (!old) return [];
        return old.filter(item => item.id !== productId);
      });

      return { previousCart };
    },
    onError: (err, variables, context: CartMutationContext | undefined) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.mine(), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
  });
}

/**
 * Mutation to replace entire cart (for merge operations)
 */
export function useReplaceCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Cart,
    Error,
    { cartId: string; products: Array<{ productId: string; quantity: number; price?: number }> }
  >({
    mutationFn: async ({ cartId, products }) => {
      return await replaceCartProducts(cartId, products);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
  });
}

/**
 * Mutation to create a new empty cart after payment
 * Used to separate paid orders from future purchases
 */
export function useCreateEmptyCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<Cart | null, Error, void>({
    mutationFn: async () => {
      return await createNewEmptyCart();
    },
    onSuccess: (newCart) => {
      const cartId = newCart?._id || newCart?.id;
      console.log('[useCreateEmptyCartMutation] New empty cart created:', cartId);
      
      // Invalidate cart queries to refetch and get the new cart
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      console.error('[useCreateEmptyCartMutation] Failed to create empty cart:', error);
    },
  });
}

