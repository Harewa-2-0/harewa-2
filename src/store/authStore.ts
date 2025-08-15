import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, logoutServer } from "@/services/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin" | string; // allow backend-specific roles (e.g., "client")
  avatar?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  emailForVerification: string;

  // UI gating flags
  hasHydratedAuth: boolean;     // server session check finished
  hasClientHydrated: boolean;   // local storage rehydrated (instant paint)

  // Kept for convenience; token is no longer used or stored
  login: (user: User, _token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  setEmailForVerification: (email: string) => void;
  setUser: (user: User, storage?: "localStorage" | "sessionStorage") => void;
  hydrateFromCookie: () => Promise<void>;
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

      // Token param retained but ignored to avoid breaking callers
      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hasHydratedAuth: true,
          hasClientHydrated: true,
        });
      },

      logout: async () => {
        // Best-effort server logout to clear HttpOnly cookies
        await logoutServer().catch(() => undefined);

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: "",
          hasHydratedAuth: true,   // final known state
          hasClientHydrated: true, // ensure UI paints immediately
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          // Redirect to home on logout or session expiry
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
          } else {
            sessionStorage.setItem("user", data);
          }
        }
      },

      // Trust the server session (HttpOnly cookies) — no Authorization header
      hydrateFromCookie: async () => {
        if (typeof window === "undefined") return;
        // Avoid duplicate work if already hydrated from server
        if (get().hasHydratedAuth) return;

        try {
          const { user } = await getMe();
          set({ user, isAuthenticated: true, hasHydratedAuth: true });
        } catch {
          // Not logged in / expired — mark as hydrated anyway
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
        // Do NOT persist hasHydratedAuth / hasClientHydrated — they recompute each load
      }),
      // Flip hasClientHydrated as soon as storage rehydrates (instant UI, no blank state)
      onRehydrateStorage: () => () => {
        const s = useAuthStore.getState();
        const logged = !!s.user;
        useAuthStore.setState({
          hasClientHydrated: true,
          // Keep isAuthenticated consistent with any stored user snapshot
          isAuthenticated: logged || s.isAuthenticated,
        });
      },
    }
  )
);
