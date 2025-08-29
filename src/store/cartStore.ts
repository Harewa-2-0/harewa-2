"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Cart, EnrichedCartItem } from "@/services/cart";
import { mapServerCartToStoreItems, getMyCart, replaceCartProducts, deleteCart, enrichCartItems, addLinesToMyCart, deduplicateCartItems } from "@/services/cart";

export type CartLine = EnrichedCartItem;

type CartState = {
  cartId?: string | null;
  items: CartLine[];
  lastSyncedAt?: number | null;
  isLoading: boolean;
  error: string | null;
  isGuestCart: boolean; // NEW: Track if this is a guest cart

  setCartId: (id?: string | null) => void;
  replaceCart: (items: CartLine[]) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  addItem: (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => void;

  // NEW: Tight optimistic quantity update
  updateQuantityOptimistic: (productId: string, newQuantity: number) => void;

  // NEW: Tight optimistic item removal
  removeItemOptimistic: (productId: string) => void;

  /** NEW: merge server → local (no overwrites/loss) */
  mergeServerCart: (server: Cart | null) => void;

  /** NEW: fetch cart from server */
  fetchCartFromServer: () => Promise<void>;

  /** NEW: Centralized cart hydration with coalescing and throttling */
  ensureHydrated: (force?: boolean) => Promise<void>;

  /** NEW: update quantity and sync to server */
  updateQuantityAndSync: (productId: string, qty: number) => Promise<void>;

  /** NEW: remove item and sync to server */
  removeItemAndSync: (productId: string) => Promise<void>;

  /** NEW: clear cart and sync to server */
  clearCartAndSync: () => Promise<void>;

  /** NEW: sync guest cart to server after login */
  syncGuestCartToServer: () => Promise<void>;

  /** NEW: mark cart as guest cart */
  setGuestCart: (isGuest: boolean) => void;

  /** NEW: utility function to deduplicate cart items */
  deduplicateItems: () => void;

  setLastSyncedNow: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  /** OPTIMIZATION: Smart background sync methods */
  startSmartBackgroundSync: () => void;
  stopBackgroundSync: () => void;

  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  backgroundSyncIntervalId?: NodeJS.Timeout;
};

const createNoopStorage = () => ({
  getItem: (_: string) => null,
  setItem: (_: string, __: string) => {},
  removeItem: (_: string) => {},
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      lastSyncedAt: null,
      isLoading: false,
      error: null,
      isGuestCart: false, // Initialize as guest cart

      setCartId: (id) => set({ cartId: id ?? null }),

      replaceCart: (items) => {
        // Use the utility function to deduplicate items
        const deduplicatedItems = deduplicateCartItems(items);
        
        set({
          items: deduplicatedItems,
        });
      },

      updateQuantity: (productId, qty) =>
        set((s) => {
          const q = Math.max(0, Math.floor(qty));
          if (q <= 0) return { items: s.items.filter((i) => i.id !== productId) };
          const idx = s.items.findIndex((i) => i.id === productId);
          if (idx >= 0) {
            const next = s.items.slice();
            next[idx] = { ...next[idx], quantity: q };
            return { items: next };
          }
          return { items: [...s.items, { id: productId, quantity: q }] };
        }),

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== productId) })),

      clearCart: () => set((s) => ({ 
        items: [], 
        cartId: s.cartId ?? null,
        isGuestCart: false // Reset guest cart flag when clearing
      })),

      addItem: (item) => {
        return set((s) => {
          const q = Math.max(1, Math.floor(item.quantity ?? 1));
          const idx = s.items.findIndex((i) => i.id === item.id);
          
          if (idx >= 0) {
            // Product exists - update quantity and preserve other properties
            const existing = s.items[idx];
            const next = s.items.slice();
            next[idx] = {
              ...existing,
              quantity: existing.quantity + q,
              // Preserve existing price if available, otherwise use new price
              price: typeof existing.price === "number" ? existing.price : item.price,
              // Preserve all other item properties
              ...item,
              id: existing.id, // Ensure ID remains the same
            };
            return { 
              items: next,
              isGuestCart: true // Mark as guest cart when items are added
            };
          } else {
            // New product - add to items
            const newState = {
              items: [
                ...s.items,
                {
                  ...item, // Preserve all item properties
                  id: String(item.id),
                  quantity: q,
                  price: typeof item.price === "number" ? item.price : undefined,
                },
              ],
              isGuestCart: true // Mark as guest cart when items are added
            };
            return newState;
          }
        });
      },

      // NEW: Tight optimistic quantity update
      updateQuantityOptimistic: (productId: string, newQuantity: number) => {
        return set((s) => {
          const q = Math.max(0, Math.floor(newQuantity));
          if (q <= 0) {
            // Remove item if quantity is 0 or negative
            return { items: s.items.filter((i) => i.id !== productId) };
          }
          
          const idx = s.items.findIndex((i) => i.id === productId);
          if (idx >= 0) {
            const next = s.items.slice();
            next[idx] = { ...next[idx], quantity: q };
            return { items: next };
          }
          return s; // No change if item not found
        });
      },

      // NEW: Tight optimistic item removal
      removeItemOptimistic: (productId: string) => {
        return set((s) => ({ 
          items: s.items.filter((i) => i.id !== productId) 
        }));
      },

      /** Merge instead of replace to avoid "disappears after open" */
      mergeServerCart: (server) => {
        if (!server) return;
        const serverId = String(server.id ?? server._id ?? "") || null;
        const serverLines = mapServerCartToStoreItems(server);

        const local = get().items;
        
        // If server has no items, clear local items to match server state
        if (serverLines.length === 0) {
          set({ 
            cartId: serverId,
            items: [], // Clear local items to match empty server cart
            isGuestCart: false
          });
        } else {
          // Combine local and server items
          const combinedItems = [...local, ...serverLines];
          
          // Deduplicate and merge quantities
          const mergedItems = deduplicateCartItems(combinedItems);
          
          set({ 
            cartId: serverId, 
            items: mergedItems,
            isGuestCart: false // Server cart is not a guest cart
          });
        }
      },

      /** Fetch cart from server and hydrate state with enriched product details */
      fetchCartFromServer: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await getMyCart();
          if (cart) {
            // Get server cart ID
            const serverId = String(cart.id ?? cart._id ?? "") || null;
            const serverLines = mapServerCartToStoreItems(cart);
            
            // Always enrich server items with product details
            if (serverLines.length > 0) {
              const enrichedItems = await enrichCartItems(serverLines);
              
              set({ 
                cartId: serverId, 
                items: enrichedItems,
                lastSyncedAt: Date.now(),
                error: null,
                isGuestCart: false // Server cart is not a guest cart
              });
            } else {
              // Server cart is empty - clear local items to match
              set({ 
                cartId: serverId,
                items: [], // Clear local items to match empty server cart
                lastSyncedAt: Date.now(),
                error: null,
                isGuestCart: false
              });
            }
          } else {
            // No cart on server - clear local items to match server state
            set({ 
              cartId: null, 
              items: [], // Always clear local items when server has no cart
              lastSyncedAt: Date.now(),
              error: null,
              isGuestCart: true // No server cart, so this is a guest cart
            });
          }
        } catch (e: any) {
          // Handle different types of errors
          if (e.status === 401 || e.status === 403) {
            // User is not authenticated - clear cart and mark as guest
            set({ 
              cartId: null, 
              items: [], // Clear items when not authenticated
              lastSyncedAt: Date.now(),
              error: null,
              isGuestCart: true,
              isLoading: false
            });
            return; // Exit early to prevent infinite loading
          } else if (e.message?.includes('expired') || e.message?.includes('jwt expired')) {
            set({ error: "Session expired. Please refresh the page." });
          } else {
            set({ error: "Failed to fetch cart from server" });
          }
          console.error("Cart fetch error:", e);
        } finally {
          set({ isLoading: false });
        }
      },

      /** Centralized cart hydration with proper single-flight + TTL logic */
      ensureHydrated: async (force = false) => {
        const now = Date.now();
        const { isGuestCart, lastSyncedAt } = get();
        
        // If not a guest cart and we have recent data, respect TTL unless forced
        if (!force && !isGuestCart && lastSyncedAt && (now - lastSyncedAt) < 3000) {
          return; // Return immediately if within 3 second TTL
        }
        
        // If there's already a fetch in flight, wait for it (single-flight)
        if (get().isLoading) {
          // Wait for current fetch to complete
          return new Promise<void>((resolve) => {
            const checkLoading = () => {
              if (!get().isLoading) {
                resolve();
              } else {
                setTimeout(checkLoading, 50);
              }
            };
            checkLoading();
          });
        }
        
        // Check if user is authenticated before attempting to fetch
        // This prevents infinite loading when user is not authenticated
        try {
          const response = await fetch('/api/auth/me', { 
            credentials: 'include',
            cache: 'no-store'
          });
          
          if (!response.ok) {
            // User is not authenticated - mark as guest cart and don't fetch
            set({ 
              cartId: null, 
              items: [], 
              lastSyncedAt: Date.now(),
              error: null,
              isGuestCart: true,
              isLoading: false
            });
            return;
          }
        } catch (error) {
          // Auth check failed - mark as guest cart and don't fetch
          set({ 
            cartId: null, 
            items: [], 
            lastSyncedAt: Date.now(),
            error: null,
            isGuestCart: true,
            isLoading: false
          });
          return;
        }
        
        // Start new fetch - this will set isLoading: true and clear it in finally
        return get().fetchCartFromServer();
      },

      /** Update quantity and sync to server */
      updateQuantityAndSync: async (productId: string, qty: number) => {
        const { cartId, items } = get();
        if (!cartId) return;

        const q = Math.max(0, Math.floor(qty));
        const updatedItems = q <= 0 
          ? items.filter(i => i.id !== productId)
          : items.map(i => i.id === productId ? { ...i, quantity: q } : i);

        // Update local state immediately
        set({ items: updatedItems });

        try {
          // Sync to server
          const serverItems = updatedItems.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          }));
          
          await replaceCartProducts(cartId, serverItems);
          set({ lastSyncedAt: Date.now(), error: null });
        } catch (error) {
          // Revert on failure
          set({ items });
          set({ error: "Failed to update quantity" });
          console.error(error);
        }
      },

      /** Remove item and sync to server */
      removeItemAndSync: async (productId: string) => {
        const { cartId, items } = get();
        if (!cartId) return;

        const updatedItems = items.filter(i => i.id !== productId);
        
        // Update local state immediately
        set({ items: updatedItems });

        try {
          // Sync to server
          const serverItems = updatedItems.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          }));
          
          await replaceCartProducts(cartId, serverItems);
          set({ lastSyncedAt: Date.now(), error: null });
        } catch (error) {
          // Revert on failure
          set({ items });
          set({ error: "Failed to remove item" });
          console.error(error);
        }
      },

      /** Clear cart and sync to server */
      clearCartAndSync: async () => {
        const { cartId, items } = get();
        if (!cartId) return;

        // Clear local state immediately
        set({ items: [] });

        try {
          // Sync to server
          await deleteCart(cartId);
          // Reset cartId to null since the cart was deleted
          set({ cartId: null, lastSyncedAt: Date.now(), error: null });
          
          // Fetch fresh cart state from server to ensure consistency
          const freshCart = await getMyCart();
          if (freshCart) {
            // If server still has a cart, sync it
            const serverItems = mapServerCartToStoreItems(freshCart);
            const enrichedItems = await enrichCartItems(serverItems);
            set({ 
              cartId: freshCart._id || freshCart.id, 
              items: enrichedItems,
              lastSyncedAt: Date.now(),
              error: null 
            });
          } else {
            // Server has no cart, ensure local state is empty
            set({ 
              cartId: null, 
              items: [],
              lastSyncedAt: Date.now(),
              error: null 
            });
          }
        } catch (error) {
          // Revert on failure
          set({ items, cartId });
          set({ error: "Failed to clear cart" });
          console.error(error);
          throw error; // Re-throw to let the UI handle the error
        }
      },

      /** NEW: sync guest cart to server after login */
      syncGuestCartToServer: async () => {
        const { items } = get();
        if (items.length === 0) return;

        const serverItems = items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
        }));

        try {
          await addLinesToMyCart(serverItems);
          set({ lastSyncedAt: Date.now(), error: null, isGuestCart: false });
        } catch (error) {
          set({ error: "Failed to sync guest cart to server" });
          console.error(error);
        }
      },

      /** NEW: mark cart as guest cart */
      setGuestCart: (isGuest) => set({ isGuestCart: isGuest }),

        /** NEW: utility function to deduplicate cart items */
  deduplicateItems: () => {
    const { items } = get();
    const deduplicatedItems = deduplicateCartItems(items);
    set({ items: deduplicatedItems });
  },

  /** NEW: handle authentication state changes */
  handleAuthStateChange: (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      // User logged out - clear cart and reset state
      set({ 
        cartId: null, 
        items: [], 
        lastSyncedAt: Date.now(),
        error: null,
        isGuestCart: true,
        isLoading: false
      });
    }
  },

  setLastSyncedNow: () => set({ lastSyncedAt: Date.now() }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      _hasHydrated: false,
      _setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (createNoopStorage() as any)
      ),
      // PERSIST MINIMAL FIELDS ONLY
      partialize: (s) => ({
        cartId: s.cartId,
        items: s.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          price: typeof i.price === "number" ? i.price : undefined,
          name: i.name,
          image: i.image,
          // Preserve other properties that might be useful
          ...Object.fromEntries(
            Object.entries(i).filter(([key, value]) => 
              !['id', 'quantity', 'price', 'name', 'image'].includes(key) && 
              value !== undefined
            )
          ),
        })),
        isGuestCart: s.isGuestCart, // Persist guest cart flag
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?._setHasHydrated(true);
        }
      },
      version: 1,
      migrate: (persisted: any) => {
        if (persisted?.items) {
          persisted.items = persisted.items.map((i: any) => ({
            id: String(i.id),
            quantity: Math.max(0, Math.floor(Number(i.quantity) || 0)),
            price: typeof i.price === "number" ? i.price : undefined,
            name: i.name || undefined,
            image: i.image || undefined,
            // Preserve other properties
            ...Object.fromEntries(
              Object.entries(i).filter(([key, value]) => 
                !['id', 'quantity', 'price', 'name', 'image'].includes(key) && 
                value !== undefined
              )
            ),
          }));
        }
        return persisted;
      },
    }
  )
);

// tiny helpers
export const useCartTotalItems = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
export const useCartSubtotalRaw = () => useCartStore((s) =>
  s.items.reduce((sum, i) => sum + (Number.isFinite(i.price!) ? (i.price as number) : 0) * i.quantity, 0)
);
export const useCartHasHydrated = () => useCartStore((s) => s._hasHydrated);
