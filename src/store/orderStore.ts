// src/store/orderStore.ts
// REFACTORED: UI-only store - server data now handled by React Query
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Order } from '@/services/order';

/** ---------- Types ---------- */

type OrderState = {
  // UI State only (no server data!)
  currentOrder: Order | null;  // The order being processed on checkout page
  
  // Actions
  setCurrentOrder: (order: Order | null) => void;
  clearCurrentOrder: () => void;
  reset: () => void;
};

/** ---------- Store (UI-only) ---------- */

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      // Initial state
      currentOrder: null,

      // Set current order (for checkout page)
      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      // Clear current order
      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      // Reset store
      reset: () => {
        set({
          currentOrder: null,
        });
      },
    }),
    {
      name: 'order-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist current order for checkout flow continuity
        currentOrder: state.currentOrder,
      }),
    }
  )
);

/** ---------- Selector Hooks ---------- */

// Get current order (for checkout page)
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder);
