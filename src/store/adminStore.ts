import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterOptions {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  status: string[]
  category: string[]
  userType: string[]
  searchQuery: string
}

interface DashboardView {
  id: string
  name: string
  layout: 'grid' | 'list' | 'table'
  columns: string[]
  filters: FilterOptions
  isDefault: boolean
}

interface AnalyticsData {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  conversionRate: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentActivity: Array<{
    id: string
    type: 'order' | 'user' | 'product' | 'system'
    message: string
    timestamp: Date
  }>
}

interface AdminState {
  // Dashboard Views
  views: DashboardView[]
  currentViewId: string | null
  
  // Filters
  globalFilters: FilterOptions
  
  // Analytics
  analytics: AnalyticsData | null
  isLoadingAnalytics: boolean
  
  // UI State
  sidebarCollapsed: boolean
  selectedTab: string
  
  // Actions
  // Views
  createView: (view: Omit<DashboardView, 'id'>) => string
  updateView: (viewId: string, updates: Partial<DashboardView>) => void
  deleteView: (viewId: string) => void
  setCurrentView: (viewId: string) => void
  setDefaultView: (viewId: string) => void
  
  // Filters
  updateGlobalFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void
  applyFilters: (filters: FilterOptions) => void
  
  // Analytics
  setAnalytics: (data: AnalyticsData) => void
  setLoadingAnalytics: (loading: boolean) => void
  refreshAnalytics: () => void
  
  // UI Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSelectedTab: (tab: string) => void
  
  // Getters
  getCurrentView: () => DashboardView | null
  getDefaultView: () => DashboardView | null
}

const defaultFilters: FilterOptions = {
  dateRange: {
    start: null,
    end: null,
  },
  status: [],
  category: [],
  userType: [],
  searchQuery: '',
}

const defaultView: DashboardView = {
  id: 'default',
  name: 'Default Dashboard',
  layout: 'grid',
  columns: ['name', 'status', 'date', 'amount'],
  filters: defaultFilters,
  isDefault: true,
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial State
      views: [defaultView],
      currentViewId: 'default',
      globalFilters: defaultFilters,
      analytics: null,
      isLoadingAnalytics: false,
      sidebarCollapsed: false,
      selectedTab: 'dashboard',
      
      // Actions
      createView: (viewData) => {
        const viewId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newView: DashboardView = {
          ...viewData,
          id: viewId,
        }
        
        set((state) => ({
          views: [...state.views, newView],
          currentViewId: viewId,
        }))
        
        return viewId
      },
      
      updateView: (viewId, updates) => set((state) => ({
        views: state.views.map(view =>
          view.id === viewId
            ? { ...view, ...updates }
            : view
        ),
      })),
      
      deleteView: (viewId) => set((state) => {
        const viewToDelete = state.views.find(view => view.id === viewId)
        if (viewToDelete?.isDefault) return state // Don't delete default view
        
        return {
          views: state.views.filter(view => view.id !== viewId),
          currentViewId: state.currentViewId === viewId ? 'default' : state.currentViewId,
        }
      }),
      
      setCurrentView: (viewId) => set({ currentViewId: viewId }),
      
      setDefaultView: (viewId) => set((state) => ({
        views: state.views.map(view => ({
          ...view,
          isDefault: view.id === viewId,
        })),
      })),
      
      updateGlobalFilters: (filterUpdates) => set((state) => ({
        globalFilters: { ...state.globalFilters, ...filterUpdates },
      })),
      
      resetFilters: () => set({ globalFilters: defaultFilters }),
      
      applyFilters: (filters) => set({ globalFilters: filters }),
      
      setAnalytics: (data) => set({ analytics: data }),
      
      setLoadingAnalytics: (loading) => set({ isLoadingAnalytics: loading }),
      
      refreshAnalytics: () => {
        // This would typically trigger an API call
        set({ isLoadingAnalytics: true })
        // Simulate API call
        setTimeout(() => {
          set({ isLoadingAnalytics: false })
        }, 1000)
      },
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      
      // Getters
      getCurrentView: () => {
        const { views, currentViewId } = get()
        return views.find(view => view.id === currentViewId) || null
      },
      
      getDefaultView: () => {
        const { views } = get()
        return views.find(view => view.isDefault) || null
      },
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({ 
        views: state.views,
        currentViewId: state.currentViewId,
        globalFilters: state.globalFilters,
        sidebarCollapsed: state.sidebarCollapsed,
        selectedTab: state.selectedTab,
      }),
    }
  )
) 