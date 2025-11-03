'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  getMyOrders, 
  createOrderFromCart, 
  deleteOrder, 
  getOrderById,
  type Order 
} from '@/services/order';
import { useAuthStore } from '@/store/authStore';

/** ---------- Types ---------- */

type OrderState = {
  // State
  currentOrder: Order | null;
  pendingOrder: Order | null;
  allOrders: Order[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  fetchPendingOrder: () => Promise<Order | null>;
  fetchAllOrders: () => Promise<void>;
  createOrder: () => Promise<{ success: boolean; order?: Order; error?: string }>;
  deletePendingOrder: () => Promise<boolean>;
  setCurrentOrder: (order: Order | null) => void;
  clearCurrentOrder: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

/** ---------- Store ---------- */

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrder: null,
      pendingOrder: null,
      allOrders: [],
      isLoading: false,
      isCreating: false,
      isDeleting: false,
      error: null,
      hasHydrated: false,

      // Fetch pending order (orders with status 'pending' or 'initiated')
      fetchPendingOrder: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (!isAuthenticated) {
          set({ pendingOrder: null, error: null });
          return null;
        }

        try {
          set({ isLoading: true, error: null });
          
          const orders = await getMyOrders();
          
          // Find pending order (pending or initiated status)
          const pending = orders.find(order => 
            order.status === 'pending' || order.status === 'initiated'
          );
          
          set({ 
            pendingOrder: pending || null, 
            allOrders: orders,
            error: null 
          });
          
          return pending || null;
        } catch (error) {
          console.error('Failed to fetch pending order:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending order';
          set({ error: errorMessage, pendingOrder: null });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch all orders
      fetchAllOrders: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (!isAuthenticated) {
          set({ allOrders: [], error: null });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          
          const orders = await getMyOrders();
          
          // Find pending order
          const pending = orders.find(order => 
            order.status === 'pending' || order.status === 'initiated'
          );
          
          set({ 
            allOrders: orders,
            pendingOrder: pending || null,
            error: null 
          });
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
          set({ error: errorMessage, allOrders: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      // Create order from cart
      createOrder: async () => {
        try {
          set({ isCreating: true, error: null });
          
          const result = await createOrderFromCart();
          
          if (result.success && result.order) {
            set({ 
              currentOrder: result.order,
              pendingOrder: result.order,
              error: null 
            });
            
            return { success: true, order: result.order };
          } else {
            const errorMessage = result.error || 'Failed to create order';
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
          }
        } catch (error) {
          console.error('Failed to create order:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isCreating: false });
        }
      },

      // Delete pending order
      deletePendingOrder: async () => {
        const { pendingOrder, allOrders, currentOrder } = get();
        
        if (!pendingOrder) {
          return false;
        }

        try {
          set({ isDeleting: true, error: null });
          
          await deleteOrder(pendingOrder._id);
          
          // Remove from allOrders array and clear current/pending order
          set({ 
            allOrders: allOrders.filter(o => o._id !== pendingOrder._id),
            pendingOrder: null,
            currentOrder: currentOrder?._id === pendingOrder._id ? null : currentOrder,
            error: null 
          });
          
          return true;
        } catch (error) {
          console.error('Failed to delete pending order:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete pending order';
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isDeleting: false });
        }
      },

      // Set current order (for checkout page)
      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      // Clear current order
      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set error state
      setError: (error) => {
        set({ error });
      },

      // Reset store
      reset: () => {
        set({
          currentOrder: null,
          pendingOrder: null,
          allOrders: [],
          isLoading: false,
          isCreating: false,
          isDeleting: false,
          error: null,
        });
      },
    }),
    {
      name: 'order-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal data to avoid quota issues
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

/** ---------- Selector Hooks ---------- */

// Get pending order
export const usePendingOrder = () => useOrderStore((state) => state.pendingOrder);

// Get current order
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder);

// Get all orders
export const useAllOrders = () => useOrderStore((state) => state.allOrders);

// Get loading states
export const useOrderLoading = () => useOrderStore((state) => ({
  isLoading: state.isLoading,
  isCreating: state.isCreating,
  isDeleting: state.isDeleting,
}));

// Get error state
export const useOrderError = () => useOrderStore((state) => state.error);

// Check if user has pending order
export const useHasPendingOrder = () => useOrderStore((state) => !!state.pendingOrder);

/** ---------- Helper Functions ---------- */

// Format order date for display
export const formatOrderDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get order status display info
export const getOrderStatusDisplay = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    case 'initiated':
      return { label: 'Payment Initiated', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'paid':
      return { label: 'Paid', color: 'text-green-600', bgColor: 'bg-green-100' };
    case 'shipped':
      return { label: 'Shipped', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    case 'delivered':
      return { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100' };
    default:
      return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};
