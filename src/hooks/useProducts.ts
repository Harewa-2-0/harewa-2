// Custom hooks for fetching products using React Query
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getProducts, adminGetProducts, type Product, type PaginatedResponse } from '@/services/products';

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

