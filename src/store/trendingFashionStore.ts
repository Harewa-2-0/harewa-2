// src/store/trendingFashionStore.ts
// REFACTORED: UI-only store - server data now handled by React Query
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@/services/products';

export interface TrendingFashionState {
  // UI State only (no server data!)
  activeCategory: string;
  filteredProducts: Product[];
  
  // Actions
  setActiveCategory: (category: string) => void;
  setFilteredProducts: (products: Product[]) => void;
  reset: () => void;
}

const DEFAULT_CATEGORY = 'Iro and Buba';

export const useTrendingFashionStore = create<TrendingFashionState>()(
  persist(
    (set) => ({
      // Initial State (UI only)
      activeCategory: DEFAULT_CATEGORY,
      filteredProducts: [],

      // Set active category (user selection)
      setActiveCategory: (category: string) => {
        set({ activeCategory: category });
      },

      // Set filtered products (called by component after filtering)
      setFilteredProducts: (products: Product[]) => {
        set({ filteredProducts: products });
      },

      // Reset to initial state
      reset: () => set({
        activeCategory: DEFAULT_CATEGORY,
        filteredProducts: [],
      }),
    }),
    {
      name: 'trending-fashion-ui-store',
      partialize: (state) => ({
        // Only persist user's category preference (not products!)
        activeCategory: state.activeCategory,
      }),
    }
  )
);
