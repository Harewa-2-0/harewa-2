// hooks/useCart.ts
import { useCartStore } from '@/store/cartStore';

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, it) => n + it.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((sum, it) => sum + it.price * it.quantity, 0));

export const useCartOpen = () =>
  useCartStore((s) => s.isOpen);

export const useCartActions = () =>
  useCartStore((s) => ({
    openCart: s.openCart,
    closeCart: s.closeCart,
    toggleCart: s.toggleCart,
    addItem: s.addItem,
    removeItem: s.removeItem,
    updateQuantity: s.updateQuantity,
    clearCart: s.clearCart,
  }));
