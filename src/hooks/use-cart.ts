import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useAuthStore } from "@/store/authStore";
import { addToMyCart } from "@/services/cart";

// Cart drawer state
export const useCartOpen = () => useCartDrawerStore((s) => s.isOpen);

export const useCartActions = () =>
  useCartDrawerStore(
    useShallow((s) => ({
      openCart: s.openCart,
      closeCart: s.closeCart,
      toggleCart: s.toggleCart,
      openCartAndFetch: s.openCartAndFetch,
      openCartForGuest: s.openCartForGuest,
    }))
  );

// OPTIMISTIC FOR ALL USERS + SERVER RECONCILIATION
export const useAuthAwareCartActions = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    // state setters
    addItem,
    updateQuantityOptimistic,
    removeItemOptimistic,
    clearCart,
    replaceCart,
    setCartId,
    // you can still keep these, but we'll do our own optimistic then reconcile
    updateQuantityAndSync,
    removeItemAndSync,
    clearCartAndSync,
    syncGuestCartToServer,
  } = useCartStore();

  // small helper to apply optimistic -> server -> reconcile/rollback
  const withOptimistic = async <T>(
    optimisticApply: () => void,
    serverCall: () => Promise<T> | T,
    reconcile?: (serverResult: T) => void
  ): Promise<T> => {
    const prev = useCartStore.getState().items; // snapshot for rollback
    try {
      // 1) Optimistic
      optimisticApply();

      // 2) Server
      const res = await serverCall();

      // 3) Reconcile with server truth (if provided)
      if (reconcile) reconcile(res);

      return res;
    } catch (err) {
      // 4) Rollback
      replaceCart(prev);
      throw err;
    }
  };

  const reconcileServerCart = (updatedCart: any) => {
    if (!updatedCart) return;
    const serverId = String(updatedCart.id ?? updatedCart._id ?? "") || null;
    const serverLines =
      updatedCart.products?.map((p: any) => ({
        id: p.product,
        quantity: p.quantity,
        price: p.price,
      })) ?? [];
    setCartId(serverId);
    replaceCart(serverLines);
  };

  const addToCart = async (
    item: { id: string; quantity?: number; price?: number } & Record<string, unknown>
  ) => {
    return withOptimistic(
      () => {
        // optimistic for ALL users
        addItem(item);
      },
      async () => {
        // guests have no server; just return a noop payload
        if (!isAuthenticated) return null;
        return await addToMyCart({
          productId: item.id,
          quantity: item.quantity ?? 1,
          price: item.price,
        });
      },
      (serverResult) => {
        if (isAuthenticated && serverResult) {
          reconcileServerCart(serverResult);
        }
      }
    );
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    return withOptimistic(
      () => {
        updateQuantityOptimistic(productId, quantity);
      },
      async () => {
        if (!isAuthenticated) return null;
        // if your existing action returns the full updated cart, great; if not,
        // you can fetch the cart here or adjust to your API.
        return await updateQuantityAndSync(productId, quantity);
      },
      (serverResult) => {
        if (isAuthenticated && serverResult) {
          // if updateQuantityAndSync returns a full cart, reconcile it:
          reconcileServerCart(serverResult);
        }
      }
    );
  };

  const removeFromCart = async (productId: string) => {
    return withOptimistic(
      () => {
        removeItemOptimistic(productId);
      },
      async () => {
        if (!isAuthenticated) return null;
        return await removeItemAndSync(productId);
      },
      (serverResult) => {
        if (isAuthenticated && serverResult) {
          reconcileServerCart(serverResult);
        }
      }
    );
  };

  const clearUserCart = async () => {
    return withOptimistic(
      () => {
        clearCart();
      },
      async () => {
        if (!isAuthenticated) return null;
        return await clearCartAndSync();
      },
      (serverResult) => {
        if (isAuthenticated && serverResult) {
          reconcileServerCart(serverResult);
        }
      }
    );
  };

  return {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearUserCart,
    syncGuestCartToServer,
    isAuthenticated,
  };
};

// Cart count for badge
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

// Cart total for display
export const useCartTotal = () =>
  useCartStore((s) =>
    s.items.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0)
  );

// Cart hydration status
export const useCartHasHydrated = () => useCartStore((s) => s._hasHydrated);
