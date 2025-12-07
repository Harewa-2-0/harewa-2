import { useShallow } from "zustand/react/shallow";
import { useCartStore, generateProductNote } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useAuthStore } from "@/store/authStore";
import { useAddToCartMutation } from "@/hooks/useCart";

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

/**
 * Auth-aware cart actions (simplified with React Query)
 * For logged-in users: Uses React Query mutations with optimistic updates
 * For guest users: Uses Zustand local state with localStorage
 */
export const useAuthAwareCartActions = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    addItem: addItemLocal,
    updateQuantity: updateQuantityLocal,
    removeItem: removeItemLocal,
    clearCart,
  } = useCartStore();

  const addToCartMutation = useAddToCartMutation();

  /**
   * Add item to cart
   * - Guest: Updates local state + localStorage
   * - Logged-in: Updates local state + syncs to server via React Query
   */
  const addToCart = async (
    item: { id: string; quantity?: number; price?: number; name?: string; image?: string; size?: string; availableSizes?: string[] }
  ) => {
    // 1. Get CURRENT state synchronously to compute next state
    const currentItems = useCartStore.getState().items;
    const currentItem = currentItems.find(i => i.id === item.id);

    // 2. Compute the NEXT breakdown and note based on current state + new item
    let nextBreakdown: Record<string, number> = {};
    if (currentItem?.sizeBreakdown) {
      nextBreakdown = { ...currentItem.sizeBreakdown };
    }

    const sizeToAdd = item.size || 'default';
    const qtyToAdd = item.quantity ?? 1;
    nextBreakdown[sizeToAdd] = (nextBreakdown[sizeToAdd] || 0) + qtyToAdd;

    const finalProductNote = generateProductNote(nextBreakdown);

    // 3. Update local state with the COMPUTED outcome (preventing race conditions in the store logic too)
    // We pass the new breakdown so the store doesn't have to guess/merge blindly if we called it twice fast
    addItemLocal({
      ...item,
      sizeBreakdown: nextBreakdown,
      productNote: finalProductNote
    });

    // 4. Update server with the SAME computed note
    if (isAuthenticated) {
      try {
        const updatedCart = await addToCartMutation.mutateAsync({
          productId: item.id,
          quantity: (currentItem?.quantity ?? 0) + qtyToAdd,
          price: item.price,
          productNote: finalProductNote,
        });

        // Just update cartId - useCartSync hook handles the rest
        if (updatedCart) {
          const cartId = (updatedCart as any)._id || (updatedCart as any).id;
          if (cartId) {
            useCartStore.setState({
              cartId,
              isGuestCart: false,
            });
          }
        }
      } catch (error) {
        console.error('Failed to add to cart on server:', error);
        // Optimistic update already applied, so cart still shows the item
        // Don't throw - let the user keep their local cart state
      }
    }
  };

  /**
   * Update cart item quantity
   * - Guest: Updates localStorage
   * - Logged-in: Syncs to server
   */
  const updateCartQuantity = async (productId: string, quantity: number) => {
    // Update local state immediately
    updateQuantityLocal(productId, quantity);

    // For logged-in users, mutation is handled by the cart drawer component
    // using useUpdateCartQuantityMutation for better optimistic updates
  };

  /**
   * Remove item from cart
   * - Guest: Updates localStorage
   * - Logged-in: Syncs to server
   */
  const removeFromCart = async (productId: string) => {
    // Update local state immediately
    removeItemLocal(productId);

    // For logged-in users, mutation is handled by the cart drawer component
    // using useRemoveFromCartMutation for better optimistic updates
  };

  /**
   * Clear cart
   * - Guest: Clears localStorage
   * - Logged-in: Clears local state (server cart remains, handled separately)
   */
  const clearUserCart = async () => {
    clearCart();
  };

  return {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearUserCart,
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

