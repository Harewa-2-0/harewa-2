'use client';

import { create } from 'zustand';

/** ---------- Types ---------- */

// Size breakdown: { "small": 2, "medium": 3 } means 2 small, 3 medium
export type SizeBreakdown = Record<string, number>;

export type CartLine = {
  id: string;          // product id
  quantity: number;    // total quantity (sum of all sizes)
  price?: number;
  name?: string;
  image?: string;
  sizeBreakdown?: SizeBreakdown;  // quantities per size
  productNote?: string;           // formatted note for backend: "2 small, 3 medium"
  availableSizes?: string[];      // all available sizes from the product
} & Record<string, unknown>;

/** ---------- Size Helpers ---------- */

// Map size names to single letters for display
export const getSizeInitial = (size: string): string => {
  const sizeMap: Record<string, string> = {
    'small': 'S',
    'medium': 'M',
    'large': 'L',
    'extra-large': 'XL',
    'extra small': 'XS',
    'xs': 'XS',
    'xl': 'XL',
    'xxl': 'XXL',
    '2xl': '2XL',
    '3xl': '3XL',
  };
  return sizeMap[size.toLowerCase()] || size.charAt(0).toUpperCase();
};

// Generate productNote from sizeBreakdown: { small: 2, medium: 3 } -> "2 small, 3 medium"
export const generateProductNote = (breakdown: SizeBreakdown): string => {
  return Object.entries(breakdown)
    .filter(([, qty]) => qty > 0)
    .map(([size, qty]) => `${qty} ${size}`)
    .join(', ');
};

// Parse productNote back to sizeBreakdown: "2 small, 3 medium" -> { small: 2, medium: 3 }
export const parseProductNote = (note: string): SizeBreakdown => {
  if (!note) return {};
  
  const breakdown: SizeBreakdown = {};
  const parts = note.split(',').map(p => p.trim());
  
  for (const part of parts) {
    const match = part.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const qty = parseInt(match[1], 10);
      const size = match[2].toLowerCase();
      if (qty > 0) {
        breakdown[size] = qty;
      }
    }
  }
  
  return breakdown;
};

// Get total quantity from size breakdown
const getTotalFromBreakdown = (breakdown: SizeBreakdown): number => {
  return Object.values(breakdown).reduce((sum, qty) => sum + qty, 0);
};

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
  addItem: (item: { id: string; quantity?: number; price?: number; size?: string; availableSizes?: string[] } & Record<string, unknown>) => void;
  updateQuantity: (productId: string, qty: number) => void;
  updateSizeQuantity: (productId: string, size: string, qty: number) => void; // Update specific size quantity
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
      const size = item.size as string | undefined;
      const availableSizes = item.availableSizes as string[] | undefined;
      const idx = state.items.findIndex((i) => i.id === id);

      let updatedItems: CartLine[];
      if (idx >= 0) {
        // Update existing item - merge size into breakdown
        updatedItems = [...state.items];
        const existingItem = updatedItems[idx];
        
        // Get or create size breakdown
        const existingBreakdown = existingItem.sizeBreakdown || {};
        const newBreakdown: SizeBreakdown = { ...existingBreakdown };
        
        if (size) {
          // Add quantity to the specified size
          newBreakdown[size] = (newBreakdown[size] || 0) + quantity;
        } else {
          // No size specified, add to 'default' or existing behavior
          newBreakdown['default'] = (newBreakdown['default'] || 0) + quantity;
        }
        
        // Calculate new total and generate product note
        const newTotal = getTotalFromBreakdown(newBreakdown);
        const newProductNote = generateProductNote(newBreakdown);
        
        // Merge available sizes (keep existing + add new ones)
        const mergedAvailableSizes = Array.from(new Set([
          ...(existingItem.availableSizes || []),
          ...(availableSizes || [])
        ]));
        
        updatedItems[idx] = {
          ...existingItem,
          quantity: newTotal,
          price: item.price ?? existingItem.price,
          name: (item.name as string) ?? existingItem.name,
          image: (item.image as string) ?? existingItem.image,
          sizeBreakdown: newBreakdown,
          productNote: newProductNote,
          availableSizes: mergedAvailableSizes.length > 0 ? mergedAvailableSizes : existingItem.availableSizes,
        };
      } else {
        // Add new item with size breakdown
        const sizeBreakdown: SizeBreakdown = {};
        if (size) {
          sizeBreakdown[size] = quantity;
        } else {
          sizeBreakdown['default'] = quantity;
        }
        
        const newItem: CartLine = {
          id,
          quantity,
          price: item.price,
          name: item.name as string,
          image: item.image as string,
          sizeBreakdown,
          productNote: generateProductNote(sizeBreakdown),
          availableSizes: availableSizes || [],
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
        updatedItems = state.items.map((i) => {
          if (i.id !== productId) return i;
          
          // If there's a size breakdown, scale all sizes proportionally
          if (i.sizeBreakdown && Object.keys(i.sizeBreakdown).length > 0) {
            const currentTotal = i.quantity;
            const ratio = quantity / currentTotal;
            const newBreakdown: SizeBreakdown = {};
            
            // Scale each size, ensuring at least 1 for sizes that had quantity
            let allocatedQty = 0;
            const sizes = Object.entries(i.sizeBreakdown).filter(([, q]) => q > 0);
            
            sizes.forEach(([size, oldQty], index) => {
              if (index === sizes.length - 1) {
                // Last size gets the remainder to ensure total matches
                newBreakdown[size] = quantity - allocatedQty;
              } else {
                const scaledQty = Math.max(1, Math.round(oldQty * ratio));
                newBreakdown[size] = scaledQty;
                allocatedQty += scaledQty;
              }
            });
            
            return {
              ...i,
              quantity,
              sizeBreakdown: newBreakdown,
              productNote: generateProductNote(newBreakdown),
            };
          }
          
          return { ...i, quantity };
        });
      }

      // Save to localStorage if guest
      if (state.isGuestCart) {
        saveGuestCartToStorage(updatedItems);
      }

      return { items: updatedItems };
    });
  },

  // Update quantity for a specific size within a product
  updateSizeQuantity: (productId, size, qty) => {
    set((state) => {
      const quantity = Math.max(0, Math.floor(qty));
      
      const updatedItems = state.items.map((item) => {
        if (item.id !== productId) return item;
        
        const breakdown = { ...(item.sizeBreakdown || {}) };
        
        if (quantity <= 0) {
          // Remove this size from breakdown
          delete breakdown[size];
        } else {
          breakdown[size] = quantity;
        }
        
        // Calculate new total
        const newTotal = getTotalFromBreakdown(breakdown);
        
        // If no sizes left, item will be filtered out
        if (newTotal <= 0) {
          return { ...item, quantity: 0, sizeBreakdown: {}, productNote: '' };
        }
        
        return {
          ...item,
          quantity: newTotal,
          sizeBreakdown: breakdown,
          productNote: generateProductNote(breakdown),
        };
      }).filter((item) => item.quantity > 0);

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
