// src/utils/order-helpers.ts

import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import type { Order } from '@/services/order';

/**
 * Prepares checkout from an existing order
 * Converts order data back to cart format and navigates to checkout
 */
export const prepareCheckoutFromOrder = async (order: Order, router: any) => {
  const { setItems, clearCart } = useCartStore.getState();
  const { setCurrentOrder } = useOrderStore.getState();

  try {
    console.log('🛒 Preparing checkout from order:', order._id);
    console.log('📦 Order structure:', order);

    // Extract products from order
    const products = order.carts?.products || [];

    if (products.length === 0) {
      throw new Error('No products found in this order');
    }

    // Transform order products back to cart items
    const cartItems = products
      .map((cartProduct: any) => {
        const product = cartProduct.product;

        if (!product || !product._id) {
          console.warn('Invalid product data:', cartProduct);
          return null;
        }

        return {
          _id: product._id,
          id: product._id,
          name: product.name,
          price: product.price,
          images: product.images || [],
          image: product.images?.[0] || '/placeholder.png',
          description: product.description || '',
          quantity: cartProduct.quantity || 1,
          category: product.category || '',
          stock: product.stock || 0,
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null);

    if (cartItems.length === 0) {
      throw new Error('Product details are not available for this order. Please contact support.');
    }

    console.log('✅ Transformed cart items:', cartItems);

    // Clear existing cart first
    clearCart();

    // Set new cart items from order
    setItems(cartItems);

    // Verify items were set
    const verifyItems = useCartStore.getState().items;
    console.log('✅ Cart items after setting:', verifyItems);

    // Store the original order for reference
    setCurrentOrder(order);

    console.log('🚀 Navigating to checkout...');

    // Small delay to ensure state updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to checkout
    router.push('/checkout');

    return true;
  } catch (error) {
    console.error('❌ Failed to prepare checkout from order:', error);
    throw error;
  }
};