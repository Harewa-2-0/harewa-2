"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Cart } from "@/services/cart";
import { mapServerCartToStoreItems } from "@/services/cart";

export type CartLine = {
  id: string;
  quantity: number;
  price?: number;
  // we DO NOT persist name/image here; we enrich them later
} & Record<string, unknown>;

type CartState = {
  cartId?: string | null;
  items: CartLine[];
  lastSyncedAt?: number | null;

  setCartId: (id?: string | null) => void;
  replaceCart: (items: CartLine[]) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  addItem: (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => void;

  /** NEW: merge server → local (no overwrites/loss) */
  mergeServerCart: (server: Cart | null) => void;

  setLastSyncedNow: () => void;

  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
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

      setCartId: (id) => set({ cartId: id ?? null }),

      replaceCart: (items) =>
        set({
          items: items
            .filter((i) => i && i.id && Number.isFinite(i.quantity))
            .map((i) => ({
              ...i,
              id: String(i.id),
              quantity: Math.max(0, Math.floor(i.quantity)),
              price: typeof i.price === "number" ? i.price : undefined,
            })),
        }),

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

      clearCart: () => set((s) => ({ items: [], cartId: s.cartId ?? null })),

      addItem: (item) =>
        set((s) => {
          const q = Math.max(1, Math.floor(item.quantity ?? 1));
          const idx = s.items.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            const existing = s.items[idx];
            const next = s.items.slice();
            next[idx] = {
              ...existing,
              quantity: existing.quantity + q,
              price: typeof existing.price === "number" ? existing.price : item.price,
              ...item,
              id: existing.id,
            };
            return { items: next };
          }
          return {
            items: [
              ...s.items,
              {
                ...item,
                id: String(item.id),
                quantity: q,
                price: typeof item.price === "number" ? item.price : undefined,
              },
            ],
          };
        }),

      /** Merge instead of replace to avoid “disappears after open” */
      mergeServerCart: (server) => {
        if (!server) return;
        const serverId = String(server.id ?? server._id ?? "") || null;
        const serverLines = mapServerCartToStoreItems(server);

        const local = get().items;
        const map = new Map<string, CartLine>();
        for (const i of local) map.set(i.id, { ...i });
        for (const s of serverLines) {
          const cur = map.get(s.id);
          if (cur) {
            map.set(s.id, {
              ...cur,
              quantity: Math.max(cur.quantity, 0) + Math.max(s.quantity, 0),
              // keep existing price if present; otherwise take server price
              price: typeof cur.price === "number" ? cur.price : s.price,
            });
          } else {
            map.set(s.id, { ...s });
          }
        }
        set({ cartId: serverId, items: Array.from(map.values()) });
      },

      setLastSyncedNow: () => set({ lastSyncedAt: Date.now() }),

      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),
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
        })),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?._setHasHydrated(true);
      },
      version: 1,
      migrate: (persisted: any) => {
        if (persisted?.items) {
          persisted.items = persisted.items.map((i: any) => ({
            id: String(i.id),
            quantity: Math.max(0, Math.floor(Number(i.quantity) || 0)),
            price: typeof i.price === "number" ? i.price : undefined,
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
