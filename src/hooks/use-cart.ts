import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawerStore } from "@/store/cartDrawerStore";
import { useAuthStore } from "@/store/authStore";
import { addToMyCart, removeProductFromMyCart, updateProductQuantityInMyCart, mapServerCartToStoreItems } from "@/services/cart";

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

// SIMPLIFIED CART ACTIONS
export const useAuthAwareCartActions = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncToServer,
    fetchCart,
  } = useCartStore();

  // Simple cart actions
  const addToCart = async (
    item: { id: string; quantity?: number; price?: number } & Record<string, unknown>
  ) => {
    // Update local state immediately
    addItem(item);
    
    // Sync to server if authenticated
    if (isAuthenticated) {
      try {
        const updatedCart = await addToMyCart({
          productId: item.id,
          quantity: item.quantity ?? 1,
          price: item.price,
        });
        // Update local state with server response, preserving local item data
        if (updatedCart) {
          const serverItems = mapServerCartToStoreItems(updatedCart);
          const currentItems = useCartStore.getState().items;
          
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
          
          useCartStore.setState({ 
            cartId: updatedCart._id || updatedCart.id, 
            items: mergedItems,
            isGuestCart: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    // Update local state immediately
    updateQuantity(productId, quantity);
    
    // Sync to server if authenticated
    if (isAuthenticated) {
      try {
        const updatedCart = await updateProductQuantityInMyCart(productId, quantity);
        // Update local state with server response, preserving local item data
        if (updatedCart) {
          const serverItems = mapServerCartToStoreItems(updatedCart);
          const currentItems = useCartStore.getState().items;
          
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
          
          useCartStore.setState({ 
            cartId: updatedCart._id || updatedCart.id, 
            items: mergedItems,
            isGuestCart: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to update cart quantity:', error);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    // Update local state immediately
    removeItem(productId);
    
    // Sync to server if authenticated
    if (isAuthenticated) {
      try {
        const updatedCart = await removeProductFromMyCart(productId);
        // Update local state with server response, preserving local item data
        if (updatedCart) {
          const serverItems = mapServerCartToStoreItems(updatedCart);
          const currentItems = useCartStore.getState().items;
          
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
          
          useCartStore.setState({ 
            cartId: updatedCart._id || updatedCart.id, 
            items: mergedItems,
            isGuestCart: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    }
  };

  const clearUserCart = async () => {
    // Update local state immediately
    clearCart();
    
    // Sync to server if authenticated
    if (isAuthenticated) {
      try {
        await syncToServer();
      } catch (error) {
        console.error('Failed to sync cart to server:', error);
      }
    }
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

// Cart hydration status - removed as it's no longer needed
