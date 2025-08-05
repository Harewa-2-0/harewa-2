import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  emailForVerification: string;

  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  setEmailForVerification: (email: string) => void;
  setUser: (user: User, storage?: 'localStorage' | 'sessionStorage') => void;
  hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      emailForVerification: '',

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        if (typeof document !== 'undefined') {
          document.cookie = `access-token=${token}; path=/; max-age=86400`; // 1 day
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: '',
        });

        if (typeof window !== 'undefined') {
          document.cookie = 'access-token=; path=/; max-age=0';
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');

          // ✅ Redirect to home on logout or session expiry
          window.location.href = '/';
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
          token: null,
          isAuthenticated: false,
          isLoading: false,
          emailForVerification: '',
        }),

      setEmailForVerification: (email) =>
        set({ emailForVerification: email }),

      setUser: (user, storage = 'localStorage') => {
        set({ user, isAuthenticated: true });

        if (typeof window !== 'undefined') {
          const data = JSON.stringify(user);
          if (storage === 'localStorage') {
            localStorage.setItem('user', data);
          } else {
            sessionStorage.setItem('user', data);
          }
        }
      },

      hydrateFromCookie: async () => {
        if (typeof window === 'undefined') return;

        let token: string | null = null;

        // Try cookie first
        const cookies = Object.fromEntries(
          document.cookie.split('; ').map((c) => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
          })
        );

        token = cookies['access-token'] || null;

        // Fallback to localStorage
        if (!token) {
          try {
            const storedUser = localStorage.getItem('user');
            const parsed = storedUser ? JSON.parse(storedUser) : null;
            if (parsed?.token) {
              token = parsed.token;
            }
          } catch (err) {
            console.warn('Failed to parse user from localStorage:', err);
          }
        }

        if (token && !get().token) {
          try {
            const res = await fetch('/api/auth/me', {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            });

            if (res.ok) {
              const user = await res.json();
              get().login(user, token);
            } else {
              console.warn('[Auth] Token invalid or expired.');
              get().logout(); // Also triggers redirect to `/`
            }
          } catch (error) {
            console.error('[Auth] Failed to hydrate user from token:', error);
            get().logout(); // Also triggers redirect to `/`
          }
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        emailForVerification: state.emailForVerification,
      }),
    }
  )
);
