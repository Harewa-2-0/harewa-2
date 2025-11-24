'use client';

import { create } from 'zustand';

/** ---------- Types ---------- */

export type CartLine = {
  id: string;          // product id
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
} & Record<string, unknown>;

type CartState = {
  // Cart data (for UI display only - React Query owns server truth)
  items: CartLine[];
  cartId?: string | null;
  isGuestCart: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isMerging: boolean; // Track when cart merge is in progress

  // Guest cart localStorage key
  guestCartStorageKey: string;

  // Actions for local state (used by React Query mutations for optimistic updates)
  addItem: (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setItems: (items: CartLine[]) => void;
  setCartId: (cartId: string | null) => void;
  setIsGuestCart: (isGuest: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsMerging: (merging: boolean) => void;

  // Guest cart helpers (localStorage-based, for non-authenticated users)
  getGuestCart: () => CartLine[];
  saveGuestCart: (items: CartLine[]) => void;
  clearGuestCart: () => void;
};

/** ---------- Guest Cart LocalStorage Helpers ---------- */

const GUEST_CART_KEY = 'guest_cart';

function loadGuestCartFromStorage(): CartLine[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load guest cart from localStorage:', error);
    return [];
  }
}

function saveGuestCartToStorage(items: CartLine[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save guest cart to localStorage:', error);
    // If quota exceeded, try to save minimal data
    if ((error as any)?.name === 'QuotaExceededError') {
      try {
        const compactItems = items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        }));
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(compactItems));
      } catch {
        console.error('Failed to save even compact guest cart');
      }
    }
  }
}

function clearGuestCartFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.warn('Failed to clear guest cart from localStorage:', error);
  }
}

/** ---------- Store (No persist middleware - cleaner!) ---------- */

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  isGuestCart: true,
  isLoading: false,
  error: null,
  isMerging: false,
  guestCartStorageKey: GUEST_CART_KEY,

  // Local state management (for optimistic updates and guest cart)
  addItem: (item) => {
    set((state) => {
      const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
      const id = String(item.id);
      const idx = state.items.findIndex((i) => i.id === id);

      let updatedItems: CartLine[];
      if (idx >= 0) {
        // Update existing item
        updatedItems = [...state.items];
        updatedItems[idx] = {
          ...updatedItems[idx],
          quantity: updatedItems[idx].quantity + quantity,
          price: item.price ?? updatedItems[idx].price,
          name: (item.name as string) ?? updatedItems[idx].name,
          image: (item.image as string) ?? updatedItems[idx].image,
          size: (item.size as string) ?? updatedItems[idx].size,
        };
      } else {
        // Add new item
        const newItem: CartLine = {
          id,
          quantity,
          price: item.price,
          name: item.name as string,
          image: item.image as string,
          size: item.size as string,
        };
        updatedItems = [...state.items, newItem];
      }

      // Save to localStorage if guest
      if (state.isGuestCart) {
        saveGuestCartToStorage(updatedItems);
      }

      return { items: updatedItems };
    });
  },

  updateQuantity: (productId, qty) => {
    set((state) => {
      const quantity = Math.max(0, Math.floor(qty));
      let updatedItems: CartLine[];
      
      if (quantity <= 0) {
        updatedItems = state.items.filter((i) => i.id !== productId);
      } else {
        updatedItems = state.items.map((i) => 
          i.id === productId ? { ...i, quantity } : i
        );
      }

      // Save to localStorage if guest
      if (state.isGuestCart) {
        saveGuestCartToStorage(updatedItems);
      }

      return { items: updatedItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updatedItems = state.items.filter((i) => i.id !== productId);
      
      // Save to localStorage if guest
      if (state.isGuestCart) {
        saveGuestCartToStorage(updatedItems);
      }
      
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    const { isGuestCart } = get();
    
    if (isGuestCart) {
      clearGuestCartFromStorage();
    }
    
    set({ items: [], cartId: null });
  },

  setItems: (items) => set({ items }),
  setCartId: (cartId) => set({ cartId }),
  setIsGuestCart: (isGuest) => set({ isGuestCart: isGuest }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setIsMerging: (merging) => set({ isMerging: merging }),

  // Guest cart helpers
  getGuestCart: () => {
    return loadGuestCartFromStorage();
  },

  saveGuestCart: (items) => {
    saveGuestCartToStorage(items);
    set({ items });
  },

  clearGuestCart: () => {
    clearGuestCartFromStorage();
    set({ items: [], isGuestCart: true });
  },
}));

/** ---------- Selector Hooks ---------- */

export const useCartTotalItems = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((s) =>
    s.items.reduce(
      (sum, i) => sum + (Number.isFinite(i.price!) ? (i.price as number) : 0) * i.quantity,
      0
    )
  );

export const useCartTotalItemsOptimistic = () => {
  const items = useCartStore((s) => s.items);
  return items.reduce((sum, item) => sum + item.quantity, 0);
};
