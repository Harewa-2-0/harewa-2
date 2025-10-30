'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Cart } from '@/services/cart';

// Extend Window interface for guest cart timeout
declare global {
  interface Window {
    guestCartSaveTimeout?: NodeJS.Timeout;
  }
}
import {
  mapServerCartToStoreItems,
  getMyCart,
  replaceCartProducts,
  addLinesToMyCart,
  deduplicateCartItems,
} from '@/services/cart';

/** ---------- Types ---------- */

export type CartLine = {
  id: string;          // product id
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
} & Record<string, unknown>;

type CartState = {
  cartId?: string | null;
  items: CartLine[];
  isLoading: boolean;
  isMerging: boolean;
  isRefreshing: boolean;
  error: string | null;
  isGuestCart: boolean;

  hasHydratedCart: boolean;
  mergedForUserId?: string | null;

  addItem: (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  fetchCart: () => Promise<void>;
  syncToServer: () => Promise<void>;

  handleAuthStateChange: (isAuthenticated: boolean, userId?: string | null) => Promise<void>;
  markMergedFor: (userId: string | null) => void;
  mergeCart: (guestCart: CartLine[]) => Promise<void>;
  getGuestCart: () => CartLine[];
  clearGuestCart: () => void;
  refreshCartWithFullData: () => Promise<void>;
  refreshCart: () => Promise<void>;

  setLoading: (loading: boolean) => void;
  setMerging: (merging: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
};

/** ---------- SafeJSONStorage (with stale snapshot guard) ---------- */

const memoryFallback = new Map<string, string>();

// Helper function to debounce localStorage saves and handle quota issues
const saveGuestCartDebounced = (items: CartLine[]) => {
  if (typeof window === 'undefined') return;
  
  // Clear any existing timeout
  if (window.guestCartSaveTimeout) {
    clearTimeout(window.guestCartSaveTimeout);
  }
  
  // Debounce the save operation
  window.guestCartSaveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    } catch (error: any) {
      console.warn('Failed to save guest cart to localStorage:', error);
      // If quota exceeded, try to clear old data and retry
      if (error?.name === 'QuotaExceededError') {
        try {
          // Clear some old localStorage data
          const keysToRemove = ['old_cart', 'temp_cart', 'backup_cart'];
          keysToRemove.forEach(key => localStorage.removeItem(key));
          // Retry with smaller data (only essential fields)
          const compactItems = items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          }));
          localStorage.setItem('guest_cart', JSON.stringify(compactItems));
        } catch (retryError) {
          console.error('Failed to save guest cart even after cleanup:', retryError);
        }
      }
    }
  }, 500); // 500ms debounce
};
let usingMemoryFallback = false;

function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__z_cart_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function cleanupLocalStorageForSpace() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('cache_') || k.startsWith('temp_') || k.endsWith('_tmp')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// Best-effort removal to prevent stale rehydration when falling back
function tryRemoveLocalStorageKey(key: string) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

const SafeJSONStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    if (usingMemoryFallback || !storageAvailable()) {
      return memoryFallback.get(key) ?? null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      usingMemoryFallback = true;
      return memoryFallback.get(key) ?? null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      memoryFallback.set(key, value);
      usingMemoryFallback = true;
      return;
    }

    if (usingMemoryFallback || !storageAvailable()) {
      memoryFallback.set(key, value);
      usingMemoryFallback = true;
      // prevent stale snapshot resurrection on next reload
      tryRemoveLocalStorageKey(key);
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      cleanupLocalStorageForSpace();
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memoryFallback.set(key, value);
        usingMemoryFallback = true;
        // prevent stale snapshot resurrection on next reload
        tryRemoveLocalStorageKey(key);
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            '[cart] localStorage full/unavailable; using in-memory fallback. Cleared stale local snapshot.'
          );
        }
      }
    }
  },

  removeItem(key: string): void {
    // Always clear memory copy
    memoryFallback.delete(key);

    if (typeof window === 'undefined') {
      usingMemoryFallback = true;
      return;
    }

    // Also clear localStorage copy (even in fallback) to avoid stale resurrection
    tryRemoveLocalStorageKey(key);

    if (usingMemoryFallback || !storageAvailable()) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      usingMemoryFallback = true;
    }
  },
};

/** ---------- Helpers: array equality (by id, quantity, price) ---------- */

function normalize(lines: Array<{ id: string; quantity: number; price?: number }>) {
  return [...lines]
    .map(l => ({
      id: String(l.id),
      quantity: Math.max(1, Math.floor(l.quantity ?? 1)),
      price: typeof l.price === 'number' ? l.price : undefined
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function sameLines(
  a: Array<{ id: string; quantity: number; price?: number }>,
  b: Array<{ id: string; quantity: number; price?: number }>
) {
  const A = normalize(a);
  const B = normalize(b);
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++) {
    if (A[i].id !== B[i].id) return false;
    if (A[i].quantity !== B[i].quantity) return false;
    const ap = typeof A[i].price === 'number' ? A[i].price : undefined;
    const bp = typeof B[i].price === 'number' ? B[i].price : undefined;
    if (ap !== bp) return false;
  }
  return true;
}

/** ---------- Store ---------- */

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isLoading: false,
      isMerging: false,
      isRefreshing: false,
      error: null,
      isGuestCart: true,

      hasHydratedCart: false,
      mergedForUserId: null,

      addItem: (item) => {
        set((state) => {
          const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
          const id = String(item.id);
          const idx = state.items.findIndex((i) => i.id === id);

          let updatedItems;
          if (idx >= 0) {
            updatedItems = [...state.items];
            updatedItems[idx] = {
              ...updatedItems[idx],
              quantity: updatedItems[idx].quantity + quantity,
              price: item.price ?? updatedItems[idx].price,
              name: (item.name as string) ?? updatedItems[idx].name,
              image: (item.image as string) ?? updatedItems[idx].image,
            };
          } else {
            const newItem: CartLine = {
              id,
              quantity,
              price: item.price,
              name: item.name as string,
              image: item.image as string,
            };
            updatedItems = [...state.items, newItem];
          }

          // Save to guest cart if not authenticated (debounced)
          if (state.isGuestCart) {
            saveGuestCartDebounced(updatedItems);
          }

          return { items: updatedItems };
        });
      },

      updateQuantity: (productId, qty) => {
        set((state) => {
          const quantity = Math.max(0, Math.floor(qty));
          let updatedItems;
          
          if (quantity <= 0) {
            updatedItems = state.items.filter((i) => i.id !== productId);
          } else {
            updatedItems = state.items.map((i) => (i.id === productId ? { ...i, quantity } : i));
          }

          // Save to guest cart if not authenticated (debounced)
          if (state.isGuestCart) {
            saveGuestCartDebounced(updatedItems);
          }

          return { items: updatedItems };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const updatedItems = state.items.filter((i) => i.id !== productId);
          
          // Save to guest cart if not authenticated (debounced)
          if (state.isGuestCart) {
            saveGuestCartDebounced(updatedItems);
          }
          
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        // Save current items as guest cart before clearing (debounced)
        const { items } = get();
        if (items.length > 0) {
          saveGuestCartDebounced(items);
        }
        
        set({ items: [], cartId: null, isGuestCart: true, mergedForUserId: null });
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart: Cart | null = await getMyCart();
          if (cart) {
            const serverItems = mapServerCartToStoreItems(cart);
            const currentItems = get().items;

            const mergedItems = serverItems.map((serverItem) => {
              const local = currentItems.find((l) => l.id === serverItem.id);
              return {
                ...serverItem,
                name: serverItem.name || local?.name,
                image: serverItem.image || local?.image,
                price: typeof serverItem.price === 'number' ? serverItem.price : local?.price,
              };
            });

            set({
              cartId: (cart as any)._id || (cart as any).id,
              items: mergedItems,
              isGuestCart: false,
              error: null,
            });
          } else {
            set({ cartId: null, isGuestCart: true, error: null });
          }
        } catch (error: any) {
          if (error?.status === 401 || error?.status === 403) {
            set({ cartId: null, isGuestCart: true, error: null });
          } else {
            set({ error: 'Failed to fetch cart' });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      syncToServer: async () => {
        const { cartId, items } = get();
        if (!cartId || items.length === 0) return;
        try {
          const serverItems = items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          }));
          await replaceCartProducts(cartId, serverItems);
          set({ error: null });
        } catch {
          set({ error: 'Failed to sync cart' });
        }
      },

      markMergedFor: (userId) => set({ mergedForUserId: userId }),

      handleAuthStateChange: async (isAuthenticated: boolean, userId?: string | null) => {
        if (!isAuthenticated) {
          set({
            cartId: null,
            isGuestCart: true,
            error: null,
          });
          return;
        }

        const uid = userId ?? undefined;
        const { items: guestItems, mergedForUserId } = get();

        try {
          // 1) Fetch existing server cart (cookie-authenticated)
          const serverCart = await getMyCart(uid);
          const serverItems = serverCart ? mapServerCartToStoreItems(serverCart) : [];

          // 2) Merge guest + server (server precedence for price if present)
          const merged = deduplicateCartItems([...serverItems, ...guestItems]);

          // 3) Only write if merged differs from server contents
          if (!sameLines(merged, serverItems)) {
            if (serverCart && (serverCart._id || serverCart.id)) {
              await replaceCartProducts(serverCart._id || serverCart.id, merged.map(i => ({
                productId: i.id,
                quantity: i.quantity,
                price: i.price,
              })));
            } else if (merged.length > 0) {
              await addLinesToMyCart(merged.map(i => ({
                productId: i.id,
                quantity: i.quantity,
                price: i.price,
              })));
            }
          }

          // 4) Mark merged to avoid noisy repeats (even if uid is undefined)
          if (uid) {
            if (mergedForUserId !== uid) get().markMergedFor(uid);
          } else {
            if (mergedForUserId !== '__merged__') get().markMergedFor('__merged__');
          }
        } catch (e) {
          console.error('Guest->server cart merge failed:', e);
          // continue to fetch server cart
        }

        // 5) Refresh to reflect server truth
        await get().fetchCart();
      },

      mergeCart: async (guestCart: CartLine[]) => {
        const { items: currentItems, cartId, mergedForUserId } = get();
        
        // Skip if already merged for this user or no guest items to merge
        if (mergedForUserId || guestCart.length === 0) {
          return;
        }

        try {
          set({ isMerging: true, error: null });

          // 1) Fetch existing server cart
          const { getMyCart, mapServerCartToStoreItems, replaceCartProducts, addLinesToMyCart } = await import('@/services/cart');
          const serverCart = await getMyCart();
          const serverItems = serverCart ? mapServerCartToStoreItems(serverCart) : [];

          // 2) Merge guest + server items (idempotent)
          const { deduplicateCartItems } = await import('@/services/cart');
          const merged = deduplicateCartItems([...serverItems, ...guestCart]);

          // 3) Only write to server if merged differs from server contents
          if (merged.length !== serverItems.length || !merged.every((item, index) => 
            serverItems[index] && 
            serverItems[index].id === item.id && 
            serverItems[index].quantity === item.quantity
          )) {
            if (serverCart && (serverCart._id || serverCart.id)) {
              // Update existing server cart
              await replaceCartProducts(serverCart._id || serverCart.id, merged.map(i => ({
                productId: i.id,
                quantity: i.quantity,
                price: i.price,
              })));
            } else if (merged.length > 0) {
              // Create new server cart
              await addLinesToMyCart(merged.map(i => ({
                productId: i.id,
                quantity: i.quantity,
                price: i.price,
              })));
            }
          }

          // 4) Update local state with merged items
          set({
            items: merged,
            cartId: serverCart ? (serverCart._id || serverCart.id) : null,
            isGuestCart: false,
            mergedForUserId: '__merged__',
            isMerging: false,
            error: null,
          });

          // 5) Clear guest cart from localStorage after successful merge
          if (typeof window !== 'undefined') {
            localStorage.removeItem('guest_cart');
            // Clear any pending save timeout
            if (window.guestCartSaveTimeout) {
              clearTimeout(window.guestCartSaveTimeout);
              window.guestCartSaveTimeout = undefined;
            }
          }

          // 6) Refresh cart with full data to get images and complete product info
          try {
            set({ isRefreshing: true });
            await get().refreshCartWithFullData();
          } catch (refreshError) {
            console.warn('Failed to refresh cart with full data after merge:', refreshError);
            // Don't fail the entire merge if refresh fails
          } finally {
            set({ isRefreshing: false });
          }

        } catch (error) {
          console.error('Cart merge failed:', error);
          set({ 
            error: 'Failed to merge cart. Please try again.',
            isMerging: false,
            isRefreshing: false
          });
          
          // Retry logic with exponential backoff
          setTimeout(() => {
            const { mergedForUserId } = get();
            if (!mergedForUserId) {
              get().mergeCart(guestCart);
            }
          }, 2000);
        } finally {
          set({ isMerging: false, isRefreshing: false });
        }
      },

      getGuestCart: () => {
        if (typeof window === 'undefined') return [];
        
        try {
          const guestCartData = localStorage.getItem('guest_cart');
          return guestCartData ? JSON.parse(guestCartData) : [];
        } catch (error) {
          console.error('Failed to parse guest cart:', error);
          return [];
        }
      },

      clearGuestCart: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('guest_cart');
          // Clear any pending save timeout
          if (window.guestCartSaveTimeout) {
            clearTimeout(window.guestCartSaveTimeout);
            window.guestCartSaveTimeout = undefined;
          }
        }
      },

      refreshCartWithFullData: async () => {
        const { cartId, isGuestCart } = get();
        
        // Only refresh if user is authenticated and has a cart
        if (isGuestCart || !cartId) return;
        
        try {
          set({ isRefreshing: true, error: null });
          
          // Use the same getMyCart utility for consistency and proper token handling
          const { getMyCart, mapServerCartToStoreItems } = await import('@/services/cart');
          const serverCart = await getMyCart();
          
          if (serverCart) {
            // Map the server cart data to store items
            const fullItems = mapServerCartToStoreItems(serverCart);
            
            set({
              items: fullItems,
              cartId: serverCart._id || serverCart.id,
              error: null
            });
          }
        } catch (error) {
          console.error('Failed to refresh cart with full data:', error);
          set({ error: 'Failed to refresh cart data' });
        } finally {
          set({ isRefreshing: false });
        }
      },

      refreshCart: async () => {
        // Simple wrapper that calls refreshCartWithFullData
        await get().refreshCartWithFullData();
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setMerging: (merging: boolean) => set({ isMerging: merging }),
      setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => SafeJSONStorage as unknown as Storage),
      partialize: (state) => ({
        items: state.items,
        isGuestCart: state.isGuestCart,
        cartId: state.cartId,
        mergedForUserId: state.mergedForUserId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydratedCart = true;
      },
      version: 2, // bump to invalidate any stale snapshots already saved
    }
  )
);

export const useCartTotalItems = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((s) =>
    s.items.reduce(
      (sum, i) => sum + (Number.isFinite(i.price!) ? (i.price as number) : 0) * i.quantity,
      0
    )
  );

// Smart counter hook with optimistic updates
export const useCartTotalItemsOptimistic = () => {
  const items = useCartStore((s) => s.items);
  const isMerging = useCartStore((s) => s.isMerging);
  const isRefreshing = useCartStore((s) => s.isRefreshing);
  const getGuestCart = useCartStore((s) => s.getGuestCart);
  
  // Calculate current cart count
  const currentCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // During merge, show guest cart count (optimistic)
  if (isMerging) {
    const guestCart = getGuestCart();
    const guestCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    return guestCount > 0 ? guestCount : currentCount;
  }
  
  // During refresh, show current count (don't show 0)
  if (isRefreshing) {
    return currentCount;
  }
  
  // Normal state - show actual count
  return currentCount;
};
