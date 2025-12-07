// src/store/fabricsStore.ts
// UI-only store - server data handled by React Query
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Fabric } from '@/services/fabric';

export interface FabricsState {
  // UI State only (no server data!)
  activeFilter: string; // For future filtering if needed
  filteredFabrics: Fabric[];
  
  // Actions
  setActiveFilter: (filter: string) => void;
  setFilteredFabrics: (fabrics: Fabric[]) => void;
  reset: () => void;
}

const DEFAULT_FILTER = 'all';

export const useFabricsStore = create<FabricsState>()(
  persist(
    (set) => ({
      // Initial State (UI only)
      activeFilter: DEFAULT_FILTER,
      filteredFabrics: [],

      // Set active filter (for future use)
      setActiveFilter: (filter: string) => {
        set({ activeFilter: filter });
      },

      // Set filtered fabrics (called by component after filtering)
      setFilteredFabrics: (fabrics: Fabric[]) => {
        set({ filteredFabrics: fabrics });
      },

      // Reset to initial state
      reset: () => set({
        activeFilter: DEFAULT_FILTER,
        filteredFabrics: [],
      }),
    }),
    {
      name: 'fabrics-ui-store',
      partialize: (state) => ({
        // Only persist filter preference (not fabrics!)
        activeFilter: state.activeFilter,
      }),
    }
  )
);

