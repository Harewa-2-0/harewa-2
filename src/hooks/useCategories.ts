// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { getCategories, type ProductCategory } from '@/services/product-category';

// Fallback categories in case API fails
const fallbackCategories: ProductCategory[] = [
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

/**
 * Hook to fetch product categories
 * Cached for 10 minutes (categories rarely change)
 * Falls back to static categories if API fails
 */
export function useCategoriesQuery() {
  return useQuery<ProductCategory[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const categories = await getCategories();
        // Return fallback if empty
        return categories.length > 0 ? categories : fallbackCategories;
      } catch (error) {
        console.error('Failed to fetch categories, using fallback:', error);
        // Return fallback on error
        return fallbackCategories;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories rarely change)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
