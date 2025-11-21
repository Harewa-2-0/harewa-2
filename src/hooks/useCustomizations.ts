// src/hooks/useCustomizations.ts
import { useQuery } from '@tanstack/react-query';
import { getAllCustomizations, getCustomization, getUserCustomizationsById, type CustomizationResponse } from '@/services/customization';

/** Query Keys */
export const customizationKeys = {
  all: ['customizations'] as const,
  admin: () => [...customizationKeys.all, 'admin'] as const,
  byId: (id: string) => [...customizationKeys.all, id] as const,
};

/**
 * Hook to fetch all customizations (admin)
 * Used for admin dashboard and customizations management
 */
export function useAdminCustomizationsQuery(enabled: boolean = true) {
  return useQuery<CustomizationResponse[], Error>({
    queryKey: customizationKeys.admin(),
    queryFn: async () => {
      const customizations = await getAllCustomizations();
      return customizations ?? [];
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (admin data changes frequently)
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to fetch a single customization by ID (admin)
 * Used for customization detail page
 */
export function useCustomizationByIdQuery(id: string | null, enabled: boolean = true) {
  return useQuery<CustomizationResponse, Error>({
    queryKey: customizationKeys.byId(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Customization ID is required');
      const customization = await getCustomization(id);
      return customization;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (individual items change less frequently)
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to fetch all customizations for a specific user (admin)
 * Used for customer history and insights
 */
export function useUserCustomizationsQuery(userId: string | null, enabled: boolean = true) {
  return useQuery<CustomizationResponse[], Error>({
    queryKey: [...customizationKeys.all, 'user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const customizations = await getUserCustomizationsById(userId);
      return customizations ?? [];
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes (customer data changes less frequently)
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

