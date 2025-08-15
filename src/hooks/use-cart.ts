import { useCartStore } from '@/store/cartStore';
import { useCartDrawerStore } from '@/store/cartDrawerStore';
import { useShallow } from 'zustand/react/shallow';

export const useCartHasHydrated = () => useCartStore((s) => s._hasHydrated);

export const useCartCount = () => {
  const hydrated = useCartHasHydrated();
  return useCartStore((s) =>
    hydrated ? s.items.reduce((n, it) => n + it.quantity, 0) : 0
  );
};

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0));

export const useCartOpen = () => useCartDrawerStore((s) => s.isOpen);

export const useCartActions = () =>
  useCartDrawerStore(
    useShallow((s) => ({
      openCart: s.openCart,
      closeCart: s.closeCart,
      toggleCart: s.toggleCart,
    }))
  );
