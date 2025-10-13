'use client';

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/contexts/toast-context';
import type { Order } from '@/services/order';

interface CartSummaryProps {
  order?: Order | null;
}

export default function CartSummary({ order }: CartSummaryProps) {
  const { items, removeItem, fetchCart, cartId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const orderSummary = useMemo(() => {
    // If we have order data, use it; otherwise fall back to cart data
    if (order?.carts?.products) {
      const orderItems = order.carts.products.map(cartProduct => ({
        id: typeof cartProduct.product === 'string' ? cartProduct.product : (cartProduct.product as any)?._id || '',
        quantity: cartProduct.quantity,
        price: (cartProduct.product as any)?.price || 0,
        name: (cartProduct.product as any)?.name || 'Product',
        image: (cartProduct.product as any)?.images?.[0] || '/placeholder.png',
      }));

      const subtotal = orderItems.reduce((total, item) => {
        const itemPrice = typeof item.price === 'number' ? item.price : 0;
        return total + itemPrice * item.quantity;
      }, 0);

      const shipping = 15000;
      const total = subtotal + shipping;
      const itemCount = orderItems.reduce((t, i) => t + i.quantity, 0);

      return {
        itemCount,
        subtotal,
        shipping,
        total,
        savings: subtotal * 0.1,
        items: orderItems,
      };
    }

    // Fallback to cart data
    const uniqueItems = items.reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) existing.quantity += item.quantity;
      else acc.push({ ...item });
      return acc;
    }, [] as typeof items);

    const subtotal = uniqueItems.reduce((total, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);

    const shipping = 15000;
    const total = subtotal + shipping;
    const itemCount = uniqueItems.reduce((t, i) => t + i.quantity, 0);

    return {
      itemCount,
      subtotal,
      shipping,
      total,
      savings: subtotal * 0.1,
      items: uniqueItems,
    };
  }, [order, items]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleRemoveItem = async (id: string) => {
    try {
      // Update local state immediately for optimistic UI
      removeItem(id);
      
      // Show success toast immediately
      addToast("Item removed from cart", "success");
      
      // Sync to server in background if authenticated
      if (isAuthenticated && cartId) {
        try {
          // Use the optimistic DELETE endpoint that doesn't fetch cart first
          const { removeProductFromCartById } = await import('@/services/cart');
          await removeProductFromCartById(cartId, id);
          // Don't refetch cart - trust the delete operation succeeded
        } catch (serverError) {
          console.error('Failed to remove item from server:', serverError);
          // Revert the local state on server error
          addToast("Failed to remove item from server. Please try again.", "error");
          // Re-add the item to local state by refetching cart
          await fetchCart();
        }
      }
    } catch (error) {
      addToast("Failed to remove item. Please try again.", "error");
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">ORDER SUMMARY</h2>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {orderSummary.items.map((item) => {
            const name = item.name || 'Product Name';
            const image = item.image || '/placeholder.png';
            const itemTotal =
              typeof item.price === 'number' ? item.price * item.quantity : 0;
            const isPending = pendingOperations.has(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ 
                  opacity: 0, 
                  x: 300,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                transition={{ duration: 0.2 }}
                className="relative flex gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                {/* Floating delete button (top-right) - only show for cart items, not order items */}
                {!order && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isPending}
                    aria-label="Remove item"
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Product Image */}
                <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {name} x{item.quantity}
                      </h3>
                      <p className="text-xs text-gray-500">Color: Pink</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Subtotal ({orderSummary.itemCount} Items)
          </span>
          <span className="font-medium text-gray-900">
            {formatPrice(orderSummary.subtotal)}
          </span>
        </div>

        {orderSummary.savings > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Savings</span>
            <span className="font-medium text-green-600">
              -{formatPrice(orderSummary.savings)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {formatPrice(orderSummary.shipping)}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(orderSummary.total)}
        </span>
      </div>
    </div>
  );
}
