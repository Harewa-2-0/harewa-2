import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatar?: string
  fullName?: string
}

interface AuthState {
  // Auth State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  emailForVerification: string

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  setEmailForVerification: (email: string) => void
  setUser: (user: User, storage?: 'localStorage' | 'sessionStorage') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      emailForVerification: '',

      // Actions
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        emailForVerification: '',
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAuth: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        emailForVerification: '',
      }),

      setEmailForVerification: (email) => set({ emailForVerification: email }),

      setUser: (user, storage = 'localStorage') => {
        set({ user, isAuthenticated: true });
        if (storage === 'localStorage') {
          localStorage.setItem('user', JSON.stringify(user));
        } else if (storage === 'sessionStorage') {
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        emailForVerification: state.emailForVerification
      }),
    }
  )
) 