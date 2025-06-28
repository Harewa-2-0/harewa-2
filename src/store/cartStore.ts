import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
}

interface CartState {
  // Cart Items
  items: CartItem[]
  isOpen: boolean
  
  // Computed Values
  totalItems: number
  subtotal: number
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      isOpen: false,
      
      // Computed Values
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      get subtotal() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      // Actions
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id)
        
        if (existingItem) {
          // Update quantity if item already exists
          return {
            items: state.items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        } else {
          // Add new item with quantity 1
          return {
            items: [...state.items, { ...newItem, quantity: 1 }]
          }
        }
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0) // Remove items with 0 quantity
      })),
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items }), // Only persist cart items
    }
  )
) 