// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  patchMe, 
  uploadAvatar,
  type Profile,
  type ProfileUpdatePayload 
} from '@/services/profile';
import { api } from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

/** Query Keys */
export const profileKeys = {
  all: ['profile'] as const,
  mine: () => [...profileKeys.all, 'mine'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
};

/**
 * Hook to fetch user profile
 * Cached for 5 minutes (profile data doesn't change often)
 * Uses /api/auth/me endpoint (which returns profile nested in response)
 */
export function useProfileQuery(enabled: boolean = true) {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery<Profile, Error>({
    queryKey: profileKeys.mine(),
    queryFn: async () => {
      console.log('[ProfileQuery] Fetching profile from /api/auth/me');
      // Use /api/auth/me endpoint (correct endpoint that exists)
      const response = await api<any>('/api/auth/me');
      console.log('[ProfileQuery] Raw response:', response);
      
      if (response.profile) {
        // Transform the data to match our expected Profile structure
        const transformedData: Profile = {
          _id: response.profile._id,
          user: {
            email: response.profile.user?.email || '',
            username: response.profile.user?.username || '',
            isVerified: response.profile.user?.isVerified || false,
            role: response.profile.user?.role || 'user',
            phoneNumber: response.profile.user?.phoneNumber || '',
          },
          firstName: response.profile.firstName || '',
          lastName: response.profile.lastName || '',
          bio: response.profile.bio || '',
          profilePicture: response.profile.profilePicture || '',
          addresses: response.profile.addresses || []
        };
        
        console.log('[ProfileQuery] Transformed data:', transformedData);
        
        // NOTE: We do NOT auto-sync avatar here to prevent race conditions
        // Avatar syncing happens only on user actions (upload, edit) in mutations
        
        return transformedData;
      }
      
      console.error('[ProfileQuery] Invalid response structure:', response);
      throw new Error('Invalid profile response');
    },
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to get user addresses (derived from profile)
 */
export function useAddressesQuery(enabled: boolean = true) {
  const { data: profile, isLoading, error } = useProfileQuery(enabled);
  
  return {
    data: profile?.addresses ?? [],
    isLoading,
    error,
  };
}

/**
 * Hook to update user profile
 * Includes optimistic updates for instant UI feedback
 * Syncs important changes with authStore for navbar consistency
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation<Profile, Error, ProfileUpdatePayload>({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      await patchMe(payload);
      // Fetch updated profile from correct endpoint
      const response = await api<any>('/api/auth/me');
      
      if (response.profile) {
        const transformedData: Profile = {
          _id: response.profile._id,
          user: {
            email: response.profile.user.email,
            username: response.profile.user.username,
            isVerified: response.profile.user.isVerified,
            role: response.profile.user.role,
            phoneNumber: response.profile.user.phoneNumber,
          },
          firstName: response.profile.firstName || '',
          lastName: response.profile.lastName || '',
          bio: response.profile.bio || '',
          profilePicture: response.profile.profilePicture || '',
          addresses: response.profile.addresses || []
        };
        return transformedData;
      }
      
      throw new Error('Invalid profile response');
    },
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.mine() });

      // Snapshot previous value for rollback
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.mine());

      // Optimistically update profile
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.mine(), {
          ...previousProfile,
          ...newProfile,
          // Handle nested user object
          user: newProfile.username || newProfile.phone ? {
            ...previousProfile.user,
            username: newProfile.username ?? previousProfile.user.username,
            phoneNumber: newProfile.phone ?? previousProfile.user.phoneNumber,
          } : previousProfile.user,
          firstName: newProfile.firstName ?? previousProfile.firstName,
          lastName: newProfile.lastName ?? previousProfile.lastName,
          bio: newProfile.bio ?? previousProfile.bio,
          addresses: newProfile.addresses ?? previousProfile.addresses,
        });
      }

      // Return context for rollback
      return { previousProfile };
    },
    onError: (error, newProfile, context) => {
      console.error('Failed to update profile:', error);
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.mine(), context.previousProfile);
      }
    },
    onSuccess: (updatedProfile) => {
      // Update cache with server response
      queryClient.setQueryData(profileKeys.mine(), updatedProfile);
      
      // Sync critical user data with authStore (for navbar display)
      const fullName = [updatedProfile.firstName, updatedProfile.lastName].filter(Boolean).join(' ');
      updateUser({ 
        fullName: fullName || undefined,
        name: updatedProfile.user.username || fullName || undefined,
      });
      
      // Update localStorage snapshot for persistence
      if (typeof window !== 'undefined') {
        try {
          const snapshot = localStorage.getItem('auth-snapshot');
          if (snapshot) {
            const cached = JSON.parse(snapshot);
            if (cached.user) {
              cached.user.fullName = fullName || cached.user.fullName;
              cached.user.name = updatedProfile.user.username || fullName || cached.user.name;
              localStorage.setItem('auth-snapshot', JSON.stringify(cached));
            }
          }
        } catch (e) {
          console.warn('[Profile Update] Failed to update auth-snapshot:', e);
        }
      }
      
      console.log('[Profile] Profile updated successfully and synced with auth');
    },
  });
}

/**
 * Hook to upload avatar/profile picture
 * Includes optimistic updates and syncs with authStore
 */
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation<Profile, Error, File>({
    mutationFn: async (file: File) => {
      const response = await uploadAvatar(file);
      
      // The backend returns the raw profile, we need to transform it to match our Profile type
      // If response already has the correct structure, return it; otherwise transform it
      if (response && typeof response === 'object') {
        // Check if it's already in the correct format
        if ('_id' in response && 'user' in response) {
          return response as Profile;
        }
        
        // Otherwise, it might be nested or need transformation
        const profileData = (response as any).profile || response;
        
        const transformedData: Profile = {
          _id: profileData._id,
          user: {
            email: profileData.user?.email || '',
            username: profileData.user?.username || '',
            isVerified: profileData.user?.isVerified || false,
            role: profileData.user?.role || 'user',
            phoneNumber: profileData.user?.phoneNumber || '',
          },
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          profilePicture: profileData.profilePicture || '',
          addresses: profileData.addresses || []
        };
        
        return transformedData;
      }
      
      throw new Error('Invalid avatar upload response');
    },
    onMutate: async (file) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.mine() });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.mine());

      // Optimistically show preview (create object URL)
      if (previousProfile) {
        const previewUrl = URL.createObjectURL(file);
        queryClient.setQueryData<Profile>(profileKeys.mine(), {
          ...previousProfile,
          profilePicture: previewUrl,
        });
        
        // Also update authStore for immediate navbar update
        updateUser({ avatar: previewUrl });
      }

      return { previousProfile };
    },
    onError: (error, file, context) => {
      console.error('Failed to upload avatar:', error);
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.mine(), context.previousProfile);
        // Rollback authStore too
        updateUser({ avatar: context.previousProfile.profilePicture });
      }
    },
    onSuccess: (updatedProfile) => {
      // Update cache with server response
      queryClient.setQueryData(profileKeys.mine(), updatedProfile);
      
      // Sync authStore with final profile picture URL
      updateUser({ avatar: updatedProfile.profilePicture });
      
      // Update localStorage snapshot for persistence
      if (typeof window !== 'undefined') {
        try {
          const snapshot = localStorage.getItem('auth-snapshot');
          if (snapshot) {
            const cached = JSON.parse(snapshot);
            if (cached.user) {
              cached.user.avatar = updatedProfile.profilePicture;
              localStorage.setItem('auth-snapshot', JSON.stringify(cached));
            }
          }
        } catch (e) {
          console.warn('[Avatar Upload] Failed to update auth-snapshot:', e);
        }
      }
      
      // Force a background refetch to ensure we have the latest server data
      queryClient.invalidateQueries({ queryKey: profileKeys.mine() });
      
      console.log('[Profile] Avatar uploaded successfully and synced with auth');
      console.log('[Profile] Updated profile data:', updatedProfile);
    },
  });
}

