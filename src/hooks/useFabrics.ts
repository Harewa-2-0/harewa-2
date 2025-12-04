// src/hooks/useFabrics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFabrics,
  createFabric,
  updateFabric,
  deleteFabric,
  type Fabric,
  type CreateFabricInput,
  type UpdateFabricInput
} from '@/services/fabric';

/** Query Keys */
export const fabricKeys = {
  all: ['fabrics'] as const,
  lists: () => [...fabricKeys.all, 'list'] as const,
  detail: (id: string) => [...fabricKeys.all, id] as const,
};

/**
 * Hook to fetch all fabrics
 * Cached for 10 minutes (fabrics rarely change)
 */
export function useFabricsQuery(enabled: boolean = true) {
  return useQuery<Fabric[], Error>({
    queryKey: fabricKeys.lists(),
    queryFn: async () => {
      const fabrics = await getFabrics();
      return fabrics ?? [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (fabrics rarely change)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}

/**
 * Hook to create a new fabric (admin)
 */
export function useCreateFabricMutation() {
  const queryClient = useQueryClient();

  return useMutation<Fabric, Error, CreateFabricInput>({
    mutationFn: async (payload) => {
      return await createFabric(payload);
    },
    onSuccess: (newFabric) => {
      // Invalidate and refetch fabrics list
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData<Fabric[]>(fabricKeys.lists(), (old = []) => {
        // Check if fabric already exists (avoid duplicates)
        const exists = old.some(f => f._id === newFabric._id);
        if (exists) return old;
        return [newFabric, ...old];
      });
    },
    onError: (error) => {
      console.error('Error creating fabric:', error);
    },
  });
}

/**
 * Hook to update a fabric (admin)
 */
export function useUpdateFabricMutation() {
  const queryClient = useQueryClient();

  return useMutation<Fabric, Error, { _id: string; payload: UpdateFabricInput }>({
    mutationFn: async ({ _id, payload }) => {
      return await updateFabric(_id, payload);
    },
    onMutate: async ({ _id, payload }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: fabricKeys.lists() });

      // Snapshot previous value for rollback
      const previousFabrics = queryClient.getQueryData<Fabric[]>(fabricKeys.lists());

      // Optimistically update the cache
      queryClient.setQueryData<Fabric[]>(fabricKeys.lists(), (old = []) => {
        return old.map(f => 
          f._id === _id 
            ? { ...f, ...payload }
            : f
        );
      });

      // Return context for rollback
      return { previousFabrics };
    },
    onError: (error, variables, context) => {
      console.error('Error updating fabric:', error);
      // Rollback on error
      if (context?.previousFabrics) {
        queryClient.setQueryData(fabricKeys.lists(), context.previousFabrics);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() });
    },
  });
}

/**
 * Hook to delete a fabric (admin)
 */
export function useDeleteFabricMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: async (_id) => {
      return await deleteFabric(_id);
    },
    onMutate: async (_id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: fabricKeys.lists() });

      // Snapshot previous value for rollback
      const previousFabrics = queryClient.getQueryData<Fabric[]>(fabricKeys.lists());

      // Optimistically remove the fabric
      queryClient.setQueryData<Fabric[]>(fabricKeys.lists(), (old = []) => {
        return old.filter(f => f._id !== _id);
      });

      // Return context for rollback
      return { previousFabrics };
    },
    onError: (error, _id, context) => {
      console.error('Error deleting fabric:', error);
      // Rollback on error
      if (context?.previousFabrics) {
        queryClient.setQueryData(fabricKeys.lists(), context.previousFabrics);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: fabricKeys.lists() });
    },
  });
}

