import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useAuthStore } from "@/store/authStore";
import { addToMyCart, getMyCart } from "@/services/cart";

// Cart drawer state
export const useCartOpen = () => useCartDrawerStore((s) => s.isOpen);

export const useCartActions = () =>
  useCartDrawerStore(
    useShallow((s) => ({
      openCart: s.openCart,
      closeCart: s.closeCart,
      toggleCart: s.toggleCart,
      openCartForGuest: s.openCartForGuest, // For guest users
    }))
  );

export const useCartData = () =>
  useCartStore(
    useShallow((s) => ({
      items: s.items,
      cartId: s.cartId,
      isLoading: s.isLoading,
      error: s.error,
      isGuestCart: s.isGuestCart,
    }))
  );

// NEW: Authentication-aware cart actions - SINGLE SOURCE OF TRUTH
export const useAuthAwareCartActions = () => {
  const { isAuthenticated } = useAuthStore();
  const { 
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart,
    updateQuantityAndSync,
    removeItemAndSync,
    clearCartAndSync,
    syncGuestCartToServer,
    replaceCart,
    setCartId
  } = useCartStore();

  /**
   * SINGLE SOURCE OF TRUTH for adding items to cart
   * 1. Optimistic local update
   * 2. Server sync (if authenticated)
   * 3. Replace local state with server truth
   * 4. Rollback on error
   */
  const addToCart = async (item: { id: string; quantity?: number; price?: number } & Record<string, unknown>) => {
    // Step 1: Optimistic local update
    addItem(item);
    
    // Step 2: Server sync (if authenticated)
    if (isAuthenticated) {
      try {
        // Call server endpoint
        const updatedCart = await addToMyCart({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price
        });
        
        // Step 3: Replace local state with server truth
        if (updatedCart) {
          const serverId = String(updatedCart.id ?? updatedCart._id ?? "") || null;
          const serverLines = updatedCart.products?.map(p => ({
            id: p.product,
            quantity: p.quantity,
            price: p.price,
          })) || [];
          
          setCartId(serverId);
          replaceCart(serverLines);
        }
      } catch (error) {
        // Step 4: Rollback on error - fetch server truth and replace
        console.error('Failed to sync cart with server, rolling back:', error);
        try {
          const serverCart = await getMyCart();
          if (serverCart) {
            const serverId = String(serverCart.id ?? serverCart._id ?? "") || null;
            const serverLines = serverCart.products?.map(p => ({
              id: p.product,
              quantity: p.quantity,
              price: p.price,
            })) || [];
            
            setCartId(serverId);
            replaceCart(serverLines);
          } else {
            // No server cart, clear local state
            setCartId(null);
            replaceCart([]);
          }
        } catch (rollbackError) {
          console.error('Failed to rollback cart state:', rollbackError);
          // If rollback fails, we're in a bad state - clear everything
          setCartId(null);
          replaceCart([]);
        }
        
        // Re-throw error for UI handling
        throw error;
      }
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      await updateQuantityAndSync(productId, quantity);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      await removeItemAndSync(productId);
    } else {
      removeItem(productId);
    }
  };

  const clearUserCart = async () => {
    if (isAuthenticated) {
      await clearCartAndSync();
    } else {
      clearCart();
    }
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
export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

// Cart total for display
export const useCartTotal = () => useCartStore((s) => 
  s.items.reduce((sum, i) => sum + (Number.isFinite(i.price!) ? (i.price as number) : 0) * i.quantity, 0)
);

// Cart hydration status
export const useCartHasHydrated = () => useCartStore((s) => s._hasHydrated);
