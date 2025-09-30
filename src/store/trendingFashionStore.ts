import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProducts, type Product } from '@/services/products';
import { getCategories, type ProductCategory } from '@/services/product-category';

// Use the ProductCategory type from the service
export type Category = ProductCategory;

// Configuration constants
const PRODUCTS_PER_CATEGORY_LIMIT = 9; // Limit products per category for performance

export interface TrendingFashionState {
  // Data
  allProducts: Product[];
  filteredProducts: Product[];
  categories: Category[];
  
  // UI State
  activeCategory: string;
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  hasInitialized: boolean;
  hasCategoriesLoaded: boolean;
  
  // Actions
  setActiveCategory: (category: string) => void;
  fetchAllProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  initializeData: () => Promise<void>;
  filterProductsByCategory: (categoryName: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Fallback categories in case API fails
const fallbackCategories: Category[] = [
  { _id: 'fallback-1', id: 'iro-and-buba', name: 'Iro and Buba', description: 'Traditional Yoruba women\'s outfit' },
  { _id: 'fallback-2', id: 'aso-oke', name: 'Aso Oke', description: 'Handwoven traditional fabric' },
  { _id: 'fallback-3', id: 'boubou-kaftan', name: 'Boubou & Kaftan', description: 'Flowing traditional garments' },
  { _id: 'fallback-4', id: 'ankara-mix', name: 'Ankara Mix and Match', description: 'Creative Ankara styling' },
  { _id: 'fallback-5', id: 'corset-gowns', name: 'Corset Gowns & Blouses', description: 'Structured elegant wear' },
  { _id: 'fallback-6', id: 'two-piece', name: 'Two-Piece Outfits', description: 'Coordinated ensembles' },
  { _id: 'fallback-7', id: 'adire-kampala', name: 'Adire & Kampala', description: 'Traditional tie-dye and fabric' },
  { _id: 'fallback-8', id: 'asoebi-lace', name: 'Asoebi Lace', description: 'Luxurious lace collection' },
  { _id: 'fallback-9', id: 'senator-wear', name: 'Senator Wear', description: 'Formal traditional attire' },
];

// Helper function to get category name from product
const getProductCategoryName = (product: Product): string => {
  if (typeof product.category === 'string') {
    return product.category;
  }
  if (product.category && typeof product.category === 'object') {
    return product.category.name;
  }
  return '';
};

export const useTrendingFashionStore = create<TrendingFashionState>()(
  persist(
    (set, get) => ({
      // Initial State
      allProducts: [],
      filteredProducts: [],
      categories: fallbackCategories,
      activeCategory: fallbackCategories[0]?.name || 'Iro and Buba',
      isLoading: false,
      isLoadingCategories: false,
      error: null,
      hasInitialized: false,
      hasCategoriesLoaded: false,

      // Actions
      setActiveCategory: (category: string) => {
        set({ activeCategory: category });
        get().filterProductsByCategory(category);
      },

      fetchCategories: async () => {
        const state = get();
        if (state.isLoadingCategories || state.hasCategoriesLoaded) return;

        set({ isLoadingCategories: true, error: null });

        try {
          const categories = await getCategories();
          
          set({ 
            categories: categories.length > 0 ? categories : fallbackCategories,
            isLoadingCategories: false,
            hasCategoriesLoaded: true,
            error: null
          });
          
          // Set the first category as active if none is set or if current active category doesn't exist
          if (categories.length > 0) {
            const currentCategoryExists = categories.some(cat => cat.name === state.activeCategory);
            if (!currentCategoryExists) {
              get().setActiveCategory(categories[0].name);
            }
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error);
          set({ 
            categories: fallbackCategories,
            isLoadingCategories: false,
            hasCategoriesLoaded: true,
            error: error instanceof Error ? error.message : 'Failed to fetch categories'
          });
        }
      },

      initializeData: async () => {
        const state = get();
        if (state.hasInitialized && state.hasCategoriesLoaded) {
          return;
        }
        
        // Fetch both categories and products in parallel
        await Promise.all([
          get().fetchCategories(),
          get().fetchAllProducts()
        ]);

        // After both are loaded, filter products for the active category
        const currentState = get();
        if (currentState.hasInitialized && currentState.hasCategoriesLoaded) {
          get().filterProductsByCategory(currentState.activeCategory);
        }
      },

      fetchAllProducts: async () => {
        const state = get();
        if (state.isLoading || state.hasInitialized) return;

        set({ isLoading: true, error: null });

        try {
          const products = await getProducts();
          
          set({ 
            allProducts: products,
            isLoading: false,
            hasInitialized: true,
            error: null
          });
          
          // Products loaded, filtering will be handled by initializeData
        } catch (error) {
          console.error('Failed to fetch products:', error);
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            hasInitialized: true
          });
        }
      },

      filterProductsByCategory: (categoryName: string) => {
        const { allProducts } = get();
        
        if (allProducts.length === 0) {
          set({ filteredProducts: [] });
          return;
        }

        // Simple direct matching - product category must exactly match selected category
        const filtered = allProducts.filter(product => {
          const productCategoryName = getProductCategoryName(product);
          return productCategoryName === categoryName;
        });

        // Limit to first N products for performance
        const limitedProducts = filtered.slice(0, PRODUCTS_PER_CATEGORY_LIMIT);
        set({ filteredProducts: limitedProducts });
      },


      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      reset: () => set({
        allProducts: [],
        filteredProducts: [],
        categories: fallbackCategories,
        activeCategory: fallbackCategories[0]?.name || 'Iro and Buba',
        isLoading: false,
        isLoadingCategories: false,
        error: null,
        hasInitialized: false,
        hasCategoriesLoaded: false,
      }),
    }),
    {
      name: 'trending-fashion-store',
      partialize: (state) => ({
        // Only persist the essential data, not loading states
        allProducts: state.allProducts,
        activeCategory: state.activeCategory,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);
