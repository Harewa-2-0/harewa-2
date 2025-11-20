"use client";
import { create } from "zustand";

type DrawerState = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCartAndFetch: () => void; // Removed async - now just opens drawer
  openCartForGuest: () => void;
};

export const useCartDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCartAndFetch: () => {
    // Only open the drawer - fetching is handled by the centralized ensureHydrated method
    set({ isOpen: true });
  },
  openCartForGuest: () => {
    set({ isOpen: true });
    // For guests, just open the drawer - no server fetch needed
    // Local storage items will be displayed automatically
  },
}));
