import { create } from 'zustand';
import { getFabrics, type Fabric } from '@/services/fabric';

export interface FabricState {
  fabrics: Fabric[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  
  fetchFabrics: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useFabricStore = create<FabricState>()((set, get) => ({
  fabrics: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
  
  fetchFabrics: async () => {
    const state = get();
    if (state.isLoading || state.hasLoaded) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const fabrics = await getFabrics();
      set({ 
        fabrics, 
        isLoading: false, 
        hasLoaded: true, 
        error: null 
      });
    } catch (error) {
      console.error('Failed to fetch fabrics:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch fabrics',
        hasLoaded: true
      });
    }
  },
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
