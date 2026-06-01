'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toast-context';
import {
  calculateCartSubtotal,
  countCartUnits,
  dedupeCartLines,
} from '@/utils/cartDisplay';
import { formatPrice } from '@/utils/currency';

export default function CheckoutSection() {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const items = useCartStore((s) => s.items);

  const orderSummary = useMemo(() => {
    const uniqueItems = dedupeCartLines(items);
    const subtotal = calculateCartSubtotal(uniqueItems);
    const shipping = 0;
    const total = subtotal + shipping;
    const itemCount = countCartUnits(uniqueItems);
    const hasFabric = uniqueItems.some((i) => i.lineType === 'fabric');

    return { itemCount, subtotal, shipping, total, hasFabric, lineCount: uniqueItems.length };
  }, [items]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      addToast('Please enter a promo code', 'error');
      return;
    }

    setIsApplyingPromo(true);

    setTimeout(() => {
      if (promoCode.toLowerCase() === 'welcome10') {
        setAppliedPromo(promoCode);
        addToast('Promo code applied successfully! 10% off', 'success');
        setPromoCode('');
      } else {
        addToast('Invalid promo code. Please try again.', 'error');
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    addToast('Promo code removed', 'info');
  };

  const handleCheckout = () => {
    if (orderSummary.itemCount === 0) {
      addToast('Your cart is empty. Add some items before checkout.', 'error');
      return;
    }

    router.push('/checkout');
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Have a promo code?</h3>

        {appliedPromo ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">
                Promo code <strong>{appliedPromo}</strong> applied
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-green-600 hover:text-green-800 text-sm underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] text-gray-900"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || !promoCode.trim()}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isApplyingPromo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Try <strong>WELCOME10</strong> for 10% off your first order
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order summary</h2>

        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-600">
            {orderSummary.lineCount} line{orderSummary.lineCount === 1 ? '' : 's'} ·{' '}
            {orderSummary.itemCount} units
          </span>
          <span className="font-medium text-gray-900">
            {formatPrice(orderSummary.subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-[#B8941F]">Free</span>
        </div>

        {orderSummary.hasFabric && (
          <p className="text-xs text-gray-500 mb-4 rounded-lg bg-[#D4AF37]/8 border border-[#D4AF37]/15 px-3 py-2">
            Includes fabric sold by the bundle (4 or 6 yards). Not for customization orders.
          </p>
        )}

        <div className="border-t border-gray-200 my-4" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900">Subtotal</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(orderSummary.total)}
          </span>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: orderSummary.itemCount === 0 ? 1 : 1.02 }}
          whileTap={{ scale: orderSummary.itemCount === 0 ? 1 : 0.98 }}
          onClick={handleCheckout}
          disabled={orderSummary.itemCount === 0}
          className="w-full py-4 bg-[#D4AF37] cursor-pointer text-gray-900 font-bold rounded-xl hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#D4AF37]/20"
        >
          {orderSummary.itemCount === 0 ? 'Cart is empty' : 'Proceed to checkout'}
        </motion.button>

        <a
          href="/fabrics"
          className="mt-4 block text-center text-sm font-medium text-[#B8941F] hover:text-[#D4AF37] transition-colors"
        >
          Continue shopping fabrics
        </a>
      </motion.div>
    </div>
  );
}
