// Custom hooks for fetching products using React Query
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { 
  getProducts, 
  getProductById, 
  adminGetProducts,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  type Product, 
  type PaginatedResponse,
  type AdminProductInput
} from '@/services/products';

/**
 * Hook to fetch homepage products (20 products for trending + new arrivals)
 * Cached for 5 minutes, shared across homepage components
 */
export function useHomepageProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const response = await getProducts({ page: 1, limit: 20 });
      const data = 'items' in response ? response.items : response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Hook to fetch shop page products with pagination and filters
 */
export function useShopProducts(params?: {
  page?: number;
  limit?: number;
  gender?: string;
  category?: string;
  shop?: string;
  seller?: string;
}) {
  const queryKey = ['shop-products', params];
  
  return useQuery<Product[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await getProducts(params);
      const data = 'items' in response ? response.items : response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (shop data can be slightly more dynamic)
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Query keys for admin products
 */
export const adminProductKeys = {
  all: ['admin-products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) => [...adminProductKeys.lists(), params] as const,
  details: () => [...adminProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminProductKeys.details(), id] as const,
};

/**
 * Hook to fetch admin products with pagination
 */
export function useAdminProducts(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery<Product[] | PaginatedResponse<Product>, Error>({
    queryKey: adminProductKeys.list(params),
    queryFn: async () => {
      return await adminGetProducts(params);
    },
    staleTime: 1 * 60 * 1000, // 1 minute (admin data changes more frequently)
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Hook to create a new product (admin)
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, AdminProductInput>({
    mutationFn: async (payload) => {
      return await adminAddProduct(payload);
    },
    onSuccess: (newProduct) => {
      // Invalidate and refetch admin products list
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() });
      
      // Optionally update the cache optimistically
      queryClient.setQueryData(adminProductKeys.lists(), (old: any) => {
        if (!old) return old;
        
        // Handle both array and paginated response
        if (Array.isArray(old)) {
          return [newProduct, ...old];
        }
        
        if (old && typeof old === 'object' && 'items' in old) {
          return {
            ...old,
            items: [newProduct, ...old.items],
          };
        }
        
        return old;
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
}

/**
 * Hook to update a product (admin)
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; payload: Partial<AdminProductInput> }>({
    mutationFn: async ({ id, payload }) => {
      return await adminUpdateProduct(id, payload);
    },
    onSuccess: (updatedProduct, variables) => {
      // Invalidate and refetch admin products list
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() });
      
      // Update the specific product in cache if it exists
      queryClient.setQueryData(adminProductKeys.detail(variables.id), updatedProduct);
      
      // Optimistically update in list cache
      queryClient.setQueryData(adminProductKeys.lists(), (old: any) => {
        if (!old) return old;
        
        if (Array.isArray(old)) {
          return old.map((product: Product) => 
            (product._id === variables.id || product.id === variables.id) ? updatedProduct : product
          );
        }
        
        if (old && typeof old === 'object' && 'items' in old) {
          return {
            ...old,
            items: old.items.map((product: Product) => 
              (product._id === variables.id || product.id === variables.id) ? updatedProduct : product
            ),
          };
        }
        
        return old;
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });
}

/**
 * Hook to delete a product (admin)
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: async (id) => {
      return await adminDeleteProduct(id);
    },
    onSuccess: (_, productId) => {
      // Invalidate and refetch admin products list
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: adminProductKeys.detail(productId) });
      
      // Optimistically remove from list cache
      queryClient.setQueryData(adminProductKeys.lists(), (old: any) => {
        if (!old) return old;
        
        if (Array.isArray(old)) {
          return old.filter((product: Product) => 
            product._id !== productId && product.id !== productId
          );
        }
        
        if (old && typeof old === 'object' && 'items' in old) {
          return {
            ...old,
            items: old.items.filter((product: Product) => 
              product._id !== productId && product.id !== productId
            ),
          };
        }
        
        return old;
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
}

/**
 * Hook to fetch products with full control over query options
 */
export function useProductsQuery(
  params?: Record<string, string | number | boolean | undefined>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  }
) {
  return useQuery<Product[], Error>({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await getProducts(params);
      const data = 'items' in response ? response.items : response;
      return Array.isArray(data) ? data : [];
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 10 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Hook to fetch a single product by ID
 * Cached for 5 minutes, useful for product detail pages
 */
export function useProductByIdQuery(productId: string, enabled: boolean = true) {
  return useQuery<Product | null, Error>({
    queryKey: ['product', productId],
    queryFn: async () => {
      return await getProductById(productId);
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to fetch recommended products based on category
 * Automatically excludes the current product and limits to 8 items
 * Now fetches independently for parallel loading!
 */
export function useRecommendedProductsQuery(
  productId: string,
  enabled: boolean = true
) {
  return useQuery<Product[], Error>({
    queryKey: ['products', 'recommendations', productId],
    queryFn: async () => {
      // First fetch the product to get its category
      const product = await getProductById(productId);
      if (!product) return [];
      
      // Extract category ID
      const categoryId = typeof product.category === 'object' && product.category?._id 
        ? product.category._id 
        : typeof product.category === 'string' ? product.category : undefined;
      
      if (!categoryId) return [];
      
      // Fetch products from same category
      const response = await getProducts({ category: categoryId, limit: 9 });
      const products = 'items' in response ? response.items : response;
      
      if (!Array.isArray(products)) return [];
      
      // Filter out current product and limit to 8
      return products
        .filter(p => p._id !== productId)
        .slice(0, 8);
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if cached data exists
    refetchOnWindowFocus: false,
  });
}

