'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/contexts/toast-context';
import { useUpdateCartQuantityMutation, useRemoveFromCartMutation } from '@/hooks/useCart';
import { usePendingOrderQuery } from '@/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/components/Public_C/shop/CartItem';

export default function CartItems() {
  const { addToast } = useToast();
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [sizePopover, setSizePopover] = useState<{ itemId: string; mode: 'increase' | 'decrease' } | null>(null);

  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity);
  const removeItemLocal = useCartStore((s) => s.removeItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { hasPendingOrder } = usePendingOrderQuery();

  const queryClient = useQueryClient();
  const updateCartMutation = useUpdateCartQuantityMutation();
  const removeCartMutation = useRemoveFromCartMutation();

  // Items should already be deduplicated by the cartStore
  const uniqueItems = useMemo(() => {
    const productMap = new Map<string, typeof items[0]>();
    items.forEach((item) => {
      if (!item || !item.id) return;
      const productId = String(item.id);
      if (!productMap.has(productId)) {
        productMap.set(productId, { ...item });
      }
    });
    return Array.from(productMap.values());
  }, [items]);

  const handleQuantityChange = async (id: string, mode: 'increase' | 'decrease', showPopover?: boolean) => {
    if (pendingOperations.has(id)) return;

    // If showPopover is true, open the size selector
    if (showPopover) {
      setSizePopover({ itemId: id, mode });
      return;
    }

    // Otherwise, directly change quantity
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQty = mode === 'increase' ? item.quantity + 1 : Math.max(0, item.quantity - 1);
    await onChangeQty(id, newQty);
  };

  const onChangeSizeQty = async (id: string, size: string, newQty: number) => {
    await onChangeQty(id, newQty);
    setSizePopover(null);
  };

  const onChangeQty = async (id: string, qty: number) => {
    if (pendingOperations.has(id)) return;

    try {
      setPendingOperations(prev => new Set(prev).add(id));

      // Update local state immediately for optimistic UI
      updateQuantityLocal(id, qty);

      // Sync to server in background if authenticated
      if (isAuthenticated && cartId) {
        try {
          await updateCartMutation.mutateAsync({
            cartId,
            productId: id,
            quantity: qty,
            currentItems: items,
          });
        } catch (serverError) {
          console.error('Failed to update quantity on server:', serverError);
          addToast("Failed to update quantity. Changes may not be saved.", "error");
        }
      }
    } catch (error) {
      addToast("Failed to update quantity. Please try again.", "error");
      console.error("Failed to update quantity:", error);
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const onRemove = async (id: string) => {
    try {
      removeItemLocal(id);
      addToast('Item removed from cart', 'success');

      if (isAuthenticated && cartId) {
        try {
          await removeCartMutation.mutateAsync({ cartId, productId: id });
        } catch (serverError) {
          console.error('Failed to remove item from server:', serverError);
          addToast('Failed to remove item. Changes may not be saved.', 'error');
        }
      }
    } catch (error) {
      addToast('Failed to remove item. Please try again.', 'error');
      console.error('Failed to remove item:', error);
    }
  };

  if (uniqueItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
          <Image
            src="/unauthorized.png"
            alt="Empty Cart"
            width={128}
            height={128}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            priority
          />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
        <a
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium rounded-lg transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Pending Order Warning Banner */}
      {hasPendingOrder && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Active Order in Progress
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Changes to your cart will automatically update your pending order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <AnimatePresence>
        {uniqueItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            pendingOperations={pendingOperations}
            handleQuantityChange={handleQuantityChange}
            onChangeSizeQty={onChangeSizeQty}
            onRemove={onRemove}
            setSizePopover={setSizePopover}
            sizePopover={sizePopover}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
