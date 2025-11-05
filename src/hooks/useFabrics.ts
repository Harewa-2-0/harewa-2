// src/hooks/useFabrics.ts
import { useQuery } from '@tanstack/react-query';
import { getFabrics, type Fabric } from '@/services/fabric';

/**
 * Hook to fetch all fabrics
 * Cached for 10 minutes (fabrics rarely change)
 */
export function useFabricsQuery(enabled: boolean = true) {
  return useQuery<Fabric[], Error>({
    queryKey: ['fabrics'],
    queryFn: async () => {
      const fabrics = await getFabrics();
      return fabrics ?? [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (fabrics rarely change)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

