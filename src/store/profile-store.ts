'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { patchMe, uploadAvatar } from '@/services/profile';
import { api } from '@/utils/api';

// Types based on the actual /me endpoint response
export type ProfileUser = {
  email: string;
  username: string;
  isVerified: boolean;
  role: string;
  phoneNumber?: string;
  avatar?: string;
};

export type ProfileData = {
  _id: string;
  user: ProfileUser;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  addresses: ProfileAddress[];
};

export type ProfileAddress = {
  _id?: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

type State = {
  profileData?: ProfileData;
  profileCache: { data: ProfileData; timestamp: number } | null;
  loadingUser: boolean;
  savingUser: boolean;

  addresses: { home?: ProfileAddress; office?: ProfileAddress };
  loadingAddresses: boolean;
  savingAddress: boolean;

  // actions
  fetchProfile: (force?: boolean) => Promise<void>;
  saveProfile: (p: Partial<ProfileData>) => Promise<void>;
  changeAvatar: (file: File) => Promise<void>;

  fetchAddresses: () => Promise<void>;
  editAddress: (kind: 'home' | 'office', data: ProfileAddress) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: () => void;
};

export const useProfileStore = create<State>()(
  devtools((set, get) => ({
    profileData: undefined,
    profileCache: null,
    loadingUser: false,
    savingUser: false,

    addresses: {},
    loadingAddresses: false,
    savingAddress: false,

    async fetchProfile(force = false) {
      const now = Date.now();
      const cache = get().profileCache;
      const CACHE_TTL = 5000; // 5 seconds
      
      // Use cache if within TTL and not forced
      if (!force && cache && (now - cache.timestamp) < CACHE_TTL) {
        set({ profileData: cache.data });
        // Still update addresses from cached data
        await get().fetchAddresses();
        return;
      }
      
      set({ loadingUser: true });
      try {
        // Use the /me endpoint to get current profile data
        const response = await api<any>('/api/auth/me');
        
        if (response.profile) {
          // Transform the data to match our expected structure
          const transformedData: ProfileData = {
            _id: response.profile._id,
            user: {
              email: response.profile.user.email,
              username: response.profile.user.username,
              isVerified: response.profile.user.isVerified,
              role: response.profile.user.role,
              phoneNumber: response.profile.user.phoneNumber,
              avatar: response.profile.user.avatar
            },
            firstName: response.profile.firstName || '',
            lastName: response.profile.lastName || '',
            phone: response.profile.user.phoneNumber || '',
            bio: response.profile.bio || '',
            addresses: response.profile.addresses || []
          };
          
          // Update cache with fresh data
          set({ 
            profileData: transformedData,
            profileCache: { data: transformedData, timestamp: now }
          });
          
          // Also update addresses display
          await get().fetchAddresses();
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        set({ loadingUser: false });
      }
    },

    async saveProfile(p) {
      set({ savingUser: true });
      try {
        const currentProfile = get().profileData;
        if (!currentProfile) return;

        // Prepare the payload according to the API specification
        const payload: any = {
          username: p.user?.username || currentProfile.user.username,
          phone: p.phone || currentProfile.phone,
          bio: p.bio || currentProfile.bio,
          firstName: p.firstName || currentProfile.firstName,
          lastName: p.lastName || currentProfile.lastName,
        };

        // Handle addresses separately to avoid ObjectId cast errors
        if (p.addresses) {
          // For addresses, only include _id for existing addresses (from backend)
          // Remove _id for new addresses so backend can generate ObjectIds
          payload.addresses = p.addresses.map((addr: ProfileAddress) => {
            const addressPayload: any = {
              line1: addr.line1,
              city: addr.city,
              state: addr.state,
              zip: addr.zip,
              country: addr.country,
              isDefault: addr.isDefault
            };
            
            // Only include _id if it's a valid MongoDB ObjectId (24 hex characters)
            if (addr._id && /^[0-9a-fA-F]{24}$/.test(addr._id)) {
              addressPayload._id = addr._id;
            }
            
            return addressPayload;
          });
        }

        // Call the PATCH endpoint to /profile
        await patchMe(payload);
        
        // OPTIMIZATION: Update local state immediately instead of refetching
        set(state => ({
          profileData: state.profileData ? {
            ...state.profileData,
            ...p,
            // Handle nested user object updates
            user: p.user ? {
              ...state.profileData.user,
              ...p.user
            } : state.profileData.user
          } : undefined,
          // Update cache with new data
          profileCache: state.profileData ? {
            data: {
              ...state.profileData,
              ...p,
              user: p.user ? {
                ...state.profileData.user,
                ...p.user
              } : state.profileData.user
            },
            timestamp: Date.now()
          } : null
        }));
        
        // Only refetch addresses if they changed (they need backend validation)
        if (p.addresses) {
          await get().fetchAddresses();
        }
        
        // Invalidate cache to ensure fresh data on next fetch
        get().invalidateCache();
        
      } catch (error) {
        console.error('Failed to save profile:', error);
        throw error;
      } finally {
        set({ savingUser: false });
      }
    },

    async changeAvatar(file) {
      set({ savingUser: true });
      try {
        await uploadAvatar(file);
        // Invalidate cache and refetch for avatar changes
        get().invalidateCache();
        await get().fetchProfile(true);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error;
      } finally {
        set({ savingUser: false });
      }
    },

    async fetchAddresses() {
      set({ loadingAddresses: true });
      try {
        // Get addresses from the current profile data
        const profileData = get().profileData;
        if (profileData?.addresses) {
                  // Split addresses into home and office (position-based)
        const addresses = profileData.addresses;
        const home = addresses[0] || undefined;
        const office = addresses[1] || undefined;
        set({ addresses: { home, office } });
        } else {
          // No addresses yet
          set({ addresses: {} });
        }
      } finally {
        set({ loadingAddresses: false });
      }
    },

    async editAddress(kind, data) {
      set({ savingAddress: true });
      try {
        const currentProfile = get().profileData;
        if (!currentProfile) return;

        // Get current addresses array
        const currentAddresses = [...(currentProfile.addresses || [])];
        
        if (kind === 'home') {
          // Home address is always at index 0
          if (currentAddresses.length > 0) {
            // Update existing home address
            currentAddresses[0] = { ...data };
          } else {
            // Add new home address
            currentAddresses.push(data);
          }
        } else if (kind === 'office') {
          // Office address is always at index 1
          if (currentAddresses.length > 1) {
            // Update existing office address
            currentAddresses[1] = { ...data };
          } else if (currentAddresses.length === 1) {
            // We have home address, add office at index 1
            currentAddresses.push(data);
          } else {
            // No addresses yet, add empty home and then office
            currentAddresses.push({} as ProfileAddress, data);
          }
        }

        // Save the updated profile with new addresses array
        await get().saveProfile({ addresses: currentAddresses });
        
        // The saveProfile will handle local updates and cache invalidation
        // No need to call fetchAddresses here as it's called in saveProfile
      } finally {
        set({ savingAddress: false });
      }
    },

    // Cache management functions
    clearCache() {
      set({ profileCache: null });
    },

    invalidateCache() {
      set({ profileCache: null });
    },
  }))
);
