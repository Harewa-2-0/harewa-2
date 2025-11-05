// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyOrders, 
  createOrderFromCart, 
  deleteOrder, 
  type Order,
  type OrderPlacementResult 
} from '@/services/order';
import { useAuthStore } from '@/store/authStore';
import { cartKeys } from './useCart';

/** Query Keys */
export const orderKeys = {
  all: ['orders'] as const,
  mine: () => [...orderKeys.all, 'mine'] as const,
  byId: (id: string) => [...orderKeys.all, id] as const,
  pending: () => [...orderKeys.all, 'pending'] as const,
};

/**
 * Hook to fetch all user orders
 * Cached for 2 minutes (orders change frequently during checkout)
 */
export function useOrdersQuery(enabled: boolean = true) {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<Order[], Error>({
    queryKey: orderKeys.mine(),
    queryFn: async () => {
      const orders = await getMyOrders();
      return orders ?? [];
    },
    enabled: enabled && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to get the current pending/initiated order
 * Derived from useOrdersQuery (no separate API call!)
 */
export function usePendingOrderQuery(enabled: boolean = true) {
  const { data: allOrders = [], isLoading, error } = useOrdersQuery(enabled);
  
  // Find the first pending or initiated order
  const pendingOrder = allOrders.find(order => 
    order.status === 'pending' || order.status === 'initiated'
  ) ?? null;

  return {
    data: pendingOrder,
    isLoading,
    error,
    hasPendingOrder: !!pendingOrder,
  };
}

/**
 * Hook to create an order from the current cart
 * Includes optimistic updates and cache invalidation
 */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderPlacementResult, Error, void>({
    mutationFn: async () => {
      return await createOrderFromCart();
    },
    onSuccess: (result) => {
      if (result.success && result.order) {
        // Optimistically add the new order to the cache
        queryClient.setQueryData<Order[]>(orderKeys.mine(), (oldOrders = []) => {
          // Check if order already exists (avoid duplicates)
          const exists = oldOrders.some(o => o._id === result.order!._id);
          if (exists) return oldOrders;
          return [result.order!, ...oldOrders];
        });
      }
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      // Cart may have been modified, refetch it
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
      // Optionally show error toast here
    },
  });
}

/**
 * Hook to delete an order (pending/initiated orders only)
 * Includes optimistic updates
 */
export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (orderId: string) => {
      const result = await deleteOrder(orderId);
      return result.deleted ?? false;
    },
    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.mine() });

      // Snapshot previous value for rollback
      const previousOrders = queryClient.getQueryData<Order[]>(orderKeys.mine());

      // Optimistically remove the order
      queryClient.setQueryData<Order[]>(orderKeys.mine(), (oldOrders = []) => {
        return oldOrders.filter(order => order._id !== orderId);
      });

      // Return context for rollback
      return { previousOrders };
    },
    onError: (error, orderId, context) => {
      console.error('Failed to delete order:', error);
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.mine(), context.previousOrders);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
    },
  });
}

/**
 * Hook to get a specific order by ID
 * Uses cache-first approach (checks existing orders before fetching)
 */
export function useOrderByIdQuery(orderId: string | null, enabled: boolean = true) {
  const { data: allOrders = [] } = useOrdersQuery(enabled);
  
  // First check if order exists in cache
  const cachedOrder = allOrders.find(order => order._id === orderId);
  
  return useQuery<Order | null, Error>({
    queryKey: orderKeys.byId(orderId ?? ''),
    queryFn: async () => {
      // If order exists in cache, return it
      if (cachedOrder) return cachedOrder;
      
      // Otherwise, would need to fetch individual order
      // (Not implemented in current API, so return null)
      return null;
    },
    enabled: enabled && !!orderId,
    staleTime: 2 * 60 * 1000,
    initialData: cachedOrder ?? undefined,
  });
}

