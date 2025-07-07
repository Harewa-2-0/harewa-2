import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Mobile Navigation
  isMobileNavOpen: boolean
  toggleMobileNav: () => void
  closeMobileNav: () => void
  
  // Theme Mode
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Mobile Navigation
      isMobileNavOpen: false,
      toggleMobileNav: () => set((state) => ({ 
        isMobileNavOpen: !state.isMobileNavOpen 
      })),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
      
      // Theme Mode
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
) 