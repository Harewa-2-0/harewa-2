"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Cart } from "@/services/cart";
import { 
  mapServerCartToStoreItems, 
  getMyCart, 
  replaceCartProducts, 
  deleteCart, 
  addLinesToMyCart, 
  deduplicateCartItems,
  addToMyCart,
  removeProductFromMyCart,
  updateProductQuantityInMyCart
} from "@/services/cart";

// Store-specific cart item type that uses 'id' instead of 'productId'
export type CartLine = {
  id: string;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
} & Record<string, unknown>;

type CartState = {
  // Core state
  cartId?: string | null;
  items: CartLine[];
  isLoading: boolean;
  error: string | null;
  isGuestCart: boolean;

  // Core actions
  addItem: (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  // Server sync
  fetchCart: () => Promise<void>;
  syncToServer: () => Promise<void>;

  // Auth handling
  handleAuthStateChange: (isAuthenticated: boolean) => void;

  // Utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const createNoopStorage = () => ({
  getItem: (_: string) => null,
  setItem: (_: string, __: string) => {},
  removeItem: (_: string) => {},
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cartId: null,
      items: [],
      isLoading: false,
      error: null,
      isGuestCart: true,

      // Core actions
      addItem: (item) => {
        set((state) => {
          const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
          const existingIndex = state.items.findIndex((i) => i.id === item.id);
          
          if (existingIndex >= 0) {
            // Product exists - REPLACE quantity (idempotent)
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: quantity, // Replace, don't add
              price: item.price ?? updatedItems[existingIndex].price,
              name: (item.name as string) ?? updatedItems[existingIndex].name,
              image: (item.image as string) ?? updatedItems[existingIndex].image,
            };
            return { items: updatedItems };
          } else {
            // New product - add to cart
            const newItem: CartLine = {
              id: String(item.id),
              quantity: quantity,
              price: item.price,
              name: item.name as string,
              image: item.image as string,
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      updateQuantity: (productId, qty) => {
        set((state) => {
          const quantity = Math.max(0, Math.floor(qty));
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== productId) };
          }
          
          const updatedItems = state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );
          return { items: updatedItems };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId)
        }));
      },

      clearCart: () => {
        set({ items: [], cartId: null, isGuestCart: true });
      },

      // Server sync
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await getMyCart();
          if (cart) {
            const serverItems = mapServerCartToStoreItems(cart);
            const currentItems = get().items;
            
            // Merge server data with local data to preserve name, image, etc.
            const mergedItems = serverItems.map(serverItem => {
              const localItem = currentItems.find(local => local.id === serverItem.id);
              return {
                ...serverItem,
                // Preserve local data if server doesn't have it
                name: serverItem.name || localItem?.name,
                image: serverItem.image || localItem?.image,
                price: serverItem.price || localItem?.price,
              };
            });
            
            set({ 
              cartId: cart._id || cart.id, 
              items: mergedItems,
              isGuestCart: false,
              error: null
            });
          } else {
            // Don't clear items if server returns null - keep local items
            const currentState = get();
            if (currentState.items.length === 0) {
              // Only clear if local cart is also empty
              set({ 
                cartId: null, 
                items: [],
                isGuestCart: true,
                error: null
              });
            } else {
              // Keep local items, just update cartId
              set({ 
                cartId: null,
                isGuestCart: true,
                error: null
              });
            }
          }
        } catch (error: any) {
          if (error.status === 401 || error.status === 403) {
            // Don't clear items on auth error - keep local items
            const currentState = get();
            if (currentState.items.length === 0) {
              set({ 
                cartId: null, 
                items: [],
                isGuestCart: true,
                error: null
              });
            } else {
              set({ 
                cartId: null,
                isGuestCart: true,
                error: null
              });
            }
          } else {
            set({ error: "Failed to fetch cart" });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      syncToServer: async () => {
        const { cartId, items } = get();
        if (!cartId || items.length === 0) return;

        try {
          const serverItems = items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          }));
          
          await replaceCartProducts(cartId, serverItems);
          set({ error: null });
        } catch (error) {
          set({ error: "Failed to sync cart" });
        }
      },

      // Auth handling
      handleAuthStateChange: (isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          set({ 
            cartId: null, 
            items: [], 
            isGuestCart: true,
            error: null,
            isLoading: false
          });
        } else {
          // User just logged in - fetch their cart immediately
          get().fetchCart().catch((error) => {
            console.error('Failed to fetch cart on login:', error);
          });
        }
      },

      // Utilities
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (createNoopStorage() as any)
      ),
      partialize: (state) => ({
        items: state.items,
        isGuestCart: state.isGuestCart,
        cartId: state.cartId,
      }),
    }
  )
);

// Helper hooks
export const useCartTotalItems = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
export const useCartSubtotal = () => useCartStore((s) =>
  s.items.reduce((sum, i) => sum + (Number.isFinite(i.price!) ? (i.price as number) : 0) * i.quantity, 0)
);
