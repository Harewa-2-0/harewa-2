// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCategories, 
  createCategory,
  updateCategory,
  deleteCategory,
  type ProductCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput
} from '@/services/product-category';

/** Query Keys */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, id] as const,
};

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
    queryKey: categoryKeys.lists(),
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
    refetchOnMount: false,
    retry: 1,
  });
}

/**
 * Hook to create a new category (admin)
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProductCategory, Error, CreateCategoryInput>({
    mutationFn: async (payload) => {
      return await createCategory(payload);
    },
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData<ProductCategory[]>(categoryKeys.lists(), (old = []) => {
        // Check if category already exists (avoid duplicates)
        const exists = old.some(cat => cat._id === newCategory._id);
        if (exists) return old;
        return [newCategory, ...old];
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
    },
  });
}

/**
 * Hook to update a category (admin)
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProductCategory, Error, { _id: string; payload: UpdateCategoryInput }>({
    mutationFn: async ({ _id, payload }) => {
      return await updateCategory(_id, payload);
    },
    onMutate: async ({ _id, payload }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

      // Snapshot previous value for rollback
      const previousCategories = queryClient.getQueryData<ProductCategory[]>(categoryKeys.lists());

      // Optimistically update the cache
      queryClient.setQueryData<ProductCategory[]>(categoryKeys.lists(), (old = []) => {
        return old.map(cat => 
          cat._id === _id 
            ? { ...cat, ...payload }
            : cat
        );
      });

      // Return context for rollback
      return { previousCategories };
    },
    onError: (error, variables, context) => {
      console.error('Error updating category:', error);
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Hook to delete a category (admin)
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: async (_id) => {
      return await deleteCategory(_id);
    },
    onMutate: async (_id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

      // Snapshot previous value for rollback
      const previousCategories = queryClient.getQueryData<ProductCategory[]>(categoryKeys.lists());

      // Optimistically remove the category
      queryClient.setQueryData<ProductCategory[]>(categoryKeys.lists(), (old = []) => {
        return old.filter(cat => cat._id !== _id);
      });

      // Return context for rollback
      return { previousCategories };
    },
    onError: (error, _id, context) => {
      console.error('Error deleting category:', error);
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
