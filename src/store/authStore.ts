// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, logoutServer } from "@/services/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin" | string;
  avatar?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  emailForVerification: string;

  // UI gating flags
  hasHydratedAuth: boolean;
  hasClientHydrated: boolean;

  login: (user: User, _token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  setEmailForVerification: (email: string) => void;
  setUser: (user: User, storage?: "localStorage" | "sessionStorage") => void;
  hydrateFromCookie: () => Promise<void>;
  silentRefresh: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      emailForVerification: "",

      hasHydratedAuth: false,
      hasClientHydrated: false,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasHydratedAuth: true,
          hasClientHydrated: true,
        });
        
        // Persist to localStorage for instant paint on next load
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
        }
        
        // Trigger cart merge after login
        if (typeof window !== 'undefined') {
          setTimeout(async () => {
            try {
              const { useCartStore } = await import('@/store/cartStore');
              const guestCart = useCartStore.getState().getGuestCart();
              if (guestCart.length > 0) {
                await useCartStore.getState().mergeCart(guestCart);
              }
            } catch (error) {
              console.error('Failed to merge cart after login:', error);
            }
          }, 100);
        }
      },

      logout: async () => {
        await logoutServer().catch(() => undefined);

        if (typeof window !== "undefined") {
          try {
            const { useCartStore } = await import('@/store/cartStore');
            useCartStore.getState().clearCart();
            
            const { useProfileStore } = await import('@/store/profile-store');
            useProfileStore.getState().clearCache();
          } catch (error) {
            console.warn('Failed to clear stores:', error);
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: "",
          hasHydratedAuth: true,
          hasClientHydrated: true,
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("auth-snapshot");
          sessionStorage.removeItem("user");
          window.location.href = "/";
        }
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: "",
          hasHydratedAuth: true,
          hasClientHydrated: true,
        }),

      setEmailForVerification: (email) => set({ emailForVerification: email }),

      setUser: (user, storage = "localStorage") => {
        set({ user, isAuthenticated: true, hasHydratedAuth: true, hasClientHydrated: true });
        if (typeof window !== "undefined") {
          const data = JSON.stringify(user);
          if (storage === "localStorage") {
            localStorage.setItem("user", data);
            localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
          } else {
            sessionStorage.setItem("user", data);
          }
          
          setTimeout(async () => {
            try {
              const { useCartStore } = await import('@/store/cartStore');
              const guestCart = useCartStore.getState().getGuestCart();
              if (guestCart.length > 0) {
                await useCartStore.getState().mergeCart(guestCart);
              }
            } catch (error) {
              console.error('Failed to merge cart after setUser:', error);
            }
          }, 100);
        }
      },

      silentRefresh: async () => {
        if (typeof window === "undefined") return false;
        
        try {
          const { user } = await getMe();
          const currentUser = get().user;
          
          if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
            set({ user, isAuthenticated: true, hasHydratedAuth: true });
            localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
          }
          return true;
        } catch (error: any) {
          if (error?.status === 401 || error?.status === 403) {
            console.log('[Auth] Session expired, logging out');
            get().logout();
            return false;
          }
          console.warn('[Auth] Silent refresh failed:', error.message);
          return false;
        }
      },

      hydrateFromCookie: async () => {
        if (typeof window === "undefined") return;
        if (get().hasHydratedAuth) return;

        const snapshot = localStorage.getItem('auth-snapshot');
        if (snapshot) {
          try {
            const cached = JSON.parse(snapshot);
            if (cached.user && cached.isAuthenticated) {
              set({ 
                user: cached.user, 
                isAuthenticated: true, 
                hasHydratedAuth: false,
                hasClientHydrated: true 
              });
              
              setTimeout(() => {
                get().silentRefresh();
              }, 100);
              return;
            }
          } catch (e) {
            console.warn('[Auth] Invalid cached snapshot');
          }
        }

        try {
          const { user } = await getMe();
          set({ user, isAuthenticated: true, hasHydratedAuth: true });
          localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
          
          setTimeout(async () => {
            try {
              const { useCartStore } = await import('@/store/cartStore');
              const guestCart = useCartStore.getState().getGuestCart();
              if (guestCart.length > 0) {
                await useCartStore.getState().mergeCart(guestCart);
              }
            } catch (error) {
              console.error('Failed to merge cart after hydration:', error);
            }
          }, 100);
        } catch (error: any) {
          if (error?.status !== 401 && error?.status !== 403) {
            console.warn('[Auth] Hydration failed:', error.message);
          }
          set({ user: null, isAuthenticated: false, hasHydratedAuth: true });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        emailForVerification: state.emailForVerification,
      }),
      onRehydrateStorage: () => {
        console.log('[Auth] Starting rehydration from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('[Auth] Rehydration error:', error);
          }
          
          const logged = !!state?.user;
          console.log('[Auth] ✅ Client rehydrated, user present:', logged);
          
          // Use setTimeout to break the circular reference
          setTimeout(() => {
            useAuthStore.setState({
              hasClientHydrated: true,
              isAuthenticated: logged,
            });
          }, 0);
        };
      },
      skipHydration: false,
    }
  )
);