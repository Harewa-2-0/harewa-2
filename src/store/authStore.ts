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
  startRefreshTimer: () => void;
  stopRefreshTimer: () => void;
}

let refreshIntervalId: NodeJS.Timeout | null = null;
let refreshRetryCount = 0;
const MAX_RETRY_COUNT = 3;

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
        
        // Reset retry count on successful login
        refreshRetryCount = 0;
        
        // Persist to localStorage for instant paint on next load
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
        }
        
        // Start proactive token refresh
        get().startRefreshTimer();
        
        // Trigger cart merge after login
        if (typeof window !== 'undefined') {
          // Cart merge is now handled by CartHydration component with React Query
          // No manual merge needed here
        }
      },

      logout: async () => {
        get().stopRefreshTimer();
        refreshRetryCount = 0; // Reset retry count
        
        await logoutServer().catch(() => undefined);

        if (typeof window !== "undefined") {
          try {
            const { useCartStore } = await import('@/store/cartStore');
            useCartStore.getState().clearCart();
            
            // React Query caches are automatically disabled when isAuthenticated = false
            // No manual cache clearing needed
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

      clearAuth: () => {
        get().stopRefreshTimer();
        refreshRetryCount = 0;
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: "",
          hasHydratedAuth: true,
          hasClientHydrated: true,
        });
      },

      setEmailForVerification: (email) => set({ emailForVerification: email }),

      setUser: (user, storage = "localStorage") => {
        set({ user, isAuthenticated: true, hasHydratedAuth: true, hasClientHydrated: true });
        
        // Reset retry count
        refreshRetryCount = 0;
        
        if (typeof window !== "undefined") {
          const data = JSON.stringify(user);
          if (storage === "localStorage") {
            localStorage.setItem("user", data);
            localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));
          } else {
            sessionStorage.setItem("user", data);
          }
          
          // Start proactive token refresh
          get().startRefreshTimer();
          
          // Cart merge is now handled by CartHydration component with React Query
          // No manual merge needed here
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
          
          // Reset retry count on success
          refreshRetryCount = 0;
          //console.log('[Auth] ✅ Silent refresh successful');
          return true;
        } catch (error: any) {
          const status = error?.status;
          
          // IMPORTANT: Only logout on definitive auth failures (401/403)
          if (status === 401 || status === 403) {
            //console.log('[Auth] Session expired (401/403), logging out');
            await get().logout();
            return false;
          }
          
          // For network errors or other issues, just log and return false
          // Don't logout immediately - let the retry mechanism handle it
          console.warn('[Auth] Silent refresh failed (will retry):', error.message || 'Network error');
          return false;
        }
      },

      startRefreshTimer: () => {
        if (typeof window === "undefined") return;
        
        // Clear existing timer if any
        if (refreshIntervalId) {
          clearInterval(refreshIntervalId);
        }
        
        // Refresh token every 10 minutes 
        const REFRESH_INTERVAL = 10 * 60 * 1000;
        
        refreshIntervalId = setInterval(async () => {
          const state = get();
          if (state.isAuthenticated) {
            //console.log('[Auth] Running proactive token refresh...');
            
            try {
              const success = await state.silentRefresh();
              
              if (success) {
                refreshRetryCount = 0; // Reset on success
              } else {
                refreshRetryCount++;
                console.warn(`[Auth] Refresh failed (attempt ${refreshRetryCount}/${MAX_RETRY_COUNT})`);
                
                // Only logout after multiple consecutive failures
                if (refreshRetryCount >= MAX_RETRY_COUNT) {
                  console.error('[Auth] Max retry attempts reached, logging out');
                  await state.logout();
                }
              }
            } catch (error) {
              refreshRetryCount++;
              console.error(`[Auth] Refresh error (attempt ${refreshRetryCount}/${MAX_RETRY_COUNT}):`, error);
              
              if (refreshRetryCount >= MAX_RETRY_COUNT) {
                console.error('[Auth] Max retry attempts reached, logging out');
                await state.logout();
              }
            }
          }
        }, REFRESH_INTERVAL);
        
        //console.log('[Auth] Proactive refresh timer started (5min interval)');
      },

      stopRefreshTimer: () => {
        if (refreshIntervalId) {
          clearInterval(refreshIntervalId);
          refreshIntervalId = null;
          //console.log('[Auth] Proactive refresh timer stopped');
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
                hasHydratedAuth: true,
                hasClientHydrated: true 
              });
              
              // Reset retry count
              refreshRetryCount = 0;
              
              // Start proactive token refresh
              get().startRefreshTimer();
              
              // Immediately verify with server
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
          
          // Reset retry count
          refreshRetryCount = 0;
          
          // Start proactive token refresh
          get().startRefreshTimer();
          
          // Cart merge is now handled by CartHydration component with React Query
          // No manual merge needed here
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
        //console.log('[Auth] Starting rehydration from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('[Auth] Rehydration error:', error);
          }
          
          const logged = !!state?.user;
          //console.log('[Auth] ✅ Client rehydrated, user present:', logged);
          
          setTimeout(() => {
            useAuthStore.setState({
              hasClientHydrated: true,
              hasHydratedAuth: true,
              isAuthenticated: logged,
            });
            
            // Start proactive refresh timer if user is logged in
            if (logged) {
              refreshRetryCount = 0; // Reset retry count
              useAuthStore.getState().startRefreshTimer();
            }
          }, 0);
        };
      },
      skipHydration: false,
    }
  )
);