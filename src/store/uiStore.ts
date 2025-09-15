import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Mobile Navigation
  isMobileNavOpen: boolean
  toggleMobileNav: () => void
  closeMobileNav: () => void
  
  // Announcement Bar
  isAnnouncementVisible: boolean
  hideAnnouncement: () => void
  showAnnouncement: () => void
  resetAnnouncement: () => void
  
  // Scroll-based announcement visibility
  isAnnouncementHiddenByScroll: boolean
  hideAnnouncementByScroll: () => void
  showAnnouncementByScroll: () => void
  
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
      
      // Announcement Bar
      isAnnouncementVisible: true,
      hideAnnouncement: () => set({ isAnnouncementVisible: false }),
      showAnnouncement: () => set({ isAnnouncementVisible: true }),
      resetAnnouncement: () => set({ isAnnouncementVisible: true }),
      
      // Scroll-based announcement visibility
      isAnnouncementHiddenByScroll: false,
      hideAnnouncementByScroll: () => set({ isAnnouncementHiddenByScroll: true }),
      showAnnouncementByScroll: () => set({ isAnnouncementHiddenByScroll: false }),
      
      // Theme Mode
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme, not announcement state
    }
  )
) 