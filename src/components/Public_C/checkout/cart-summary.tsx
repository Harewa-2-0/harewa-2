'use client';

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/contexts/toast-context';
import {
  calculateCartSubtotal,
  countCartUnits,
  dedupeCartLines,
} from '@/utils/cartDisplay';
import { formatPrice } from '@/utils/currency';
import CartSummaryLineCard from '@/components/Public_C/cart/CartSummaryLineCard';
import type { Order } from '@/services/order';
import type { CartLine } from '@/store/cartStore';

interface CartSummaryProps {
  order?: Order | null;
}

export default function CartSummary({ order: _order }: CartSummaryProps) {
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const removeItemLocal = useCartStore((s) => s.removeItem);
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const orderSummary = useMemo(() => {
    const uniqueItems = dedupeCartLines(items);
    const subtotal = calculateCartSubtotal(uniqueItems);
    const shipping = 0;
    const fabricBundles = uniqueItems
      .filter((i) => i.lineType === 'fabric')
      .reduce((n, i) => n + i.quantity, 0);
    const productUnits = uniqueItems
      .filter((i) => i.lineType !== 'fabric')
      .reduce((n, i) => n + i.quantity, 0);

    return {
      itemCount: countCartUnits(uniqueItems),
      subtotal,
      shipping,
      total: subtotal + shipping,
      items: uniqueItems,
      fabricBundles,
      productUnits,
    };
  }, [items]);

  const handleRemoveItem = async (item: CartLine) => {
    const pendingKey = `${item.lineType ?? 'product'}:${item.id}`;
    try {
      setPendingOperations((prev) => new Set(prev).add(pendingKey));
      removeItemLocal(item.id);

      addToast('Item removed from cart', 'success');

      if (isAuthenticated && cartId) {
        const { removeCartLineById } = await import('@/services/cart');
        await removeCartLineById(cartId, {
          id: item.id,
          lineType: item.lineType,
        });
      }
    } catch (error) {
      addToast('Failed to remove item. Please try again.', 'error');
      console.error('Failed to remove item:', error);
    } finally {
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(pendingKey);
        return next;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-28"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-2">Order summary</h2>
      {(orderSummary.fabricBundles > 0 || orderSummary.productUnits > 0) && (
        <p className="text-xs text-gray-500 mb-6">
          {orderSummary.productUnits > 0 &&
            `${orderSummary.productUnits} product unit${orderSummary.productUnits === 1 ? '' : 's'}`}
          {orderSummary.productUnits > 0 && orderSummary.fabricBundles > 0 && ' · '}
          {orderSummary.fabricBundles > 0 &&
            `${orderSummary.fabricBundles} fabric bundle${orderSummary.fabricBundles === 1 ? '' : 's'}`}
        </p>
      )}

      <div className="space-y-3 mb-6 max-h-[420px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {orderSummary.items.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">Your cart is empty</p>
          ) : (
            orderSummary.items.map((item) => {
              const pendingKey = `${item.lineType ?? 'product'}:${item.id}`;
              return (
                <CartSummaryLineCard
                  key={pendingKey}
                  item={item}
                  onRemove={handleRemoveItem}
                  isPending={pendingOperations.has(pendingKey)}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal ({orderSummary.itemCount} items)</span>
          <span className="font-medium text-gray-900">
            {formatPrice(orderSummary.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-[#B8941F]">Free</span>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4" />

      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(orderSummary.total)}
        </span>
      </div>

      {orderSummary.fabricBundles > 0 && (
        <p className="text-xs text-gray-500 leading-relaxed">
          Fabric is sold in fixed yard bundles and is not customizable.
        </p>
      )}
    </motion.div>
  );
}
