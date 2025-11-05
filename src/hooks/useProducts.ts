// Custom hooks for fetching products using React Query
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  getProducts, 
  getProductById, 
  adminGetProducts, 
  type Product, 
  type PaginatedResponse 
} from '@/services/products';

/**
 * Hook to fetch homepage products (30 products for trending + new arrivals)
 * Cached for 5 minutes, shared across homepage components
 */
export function useHomepageProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const response = await getProducts({ page: 1, limit: 30 });
      const data = 'items' in response ? response.items : response;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
  });
}

/**
 * Hook to fetch admin products with pagination
 */
export function useAdminProducts(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery<Product[] | PaginatedResponse<Product>, Error>({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      return await adminGetProducts(params);
    },
    staleTime: 1 * 60 * 1000, // 1 minute (admin data changes more frequently)
    gcTime: 5 * 60 * 1000,
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
    refetchOnWindowFocus: false,
  });
}

