'use client';

import React, { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toast-context';
// import { useAuthCartSync } from '@/hooks/use-auth-cart-sync'; // No longer needed - cart merge is now global

export default function CheckoutSection() {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();
  
  // Cart merge is now handled globally in authStore - no need for component-level sync
  // useAuthCartSync();
  
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const uniqueItems = items.reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as typeof items);

    const subtotal = uniqueItems.reduce((total, item) => {
      const itemPrice = typeof item.price === "number" ? item.price : 0;
      return total + (itemPrice * item.quantity);
    }, 0);

    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    const itemCount = uniqueItems.reduce((total, item) => total + item.quantity, 0);

    return {
      itemCount,
      subtotal,
      shipping,
      total,
      savings: subtotal * 0.5, // Assuming 50% savings from original prices
    };
  }, [items]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      addToast("Please enter a promo code", "error");
      return;
    }

    setIsApplyingPromo(true);
    
    // Simulate API call
    setTimeout(() => {
      if (promoCode.toLowerCase() === 'welcome10') {
        setAppliedPromo(promoCode);
        addToast("Promo code applied successfully! 10% off", "success");
        setPromoCode('');
      } else {
        addToast("Invalid promo code. Please try again.", "error");
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    addToast("Promo code removed", "info");
  };

  const handleCheckout = () => {
    if (orderSummary.itemCount === 0) {
      addToast("Your cart is empty. Add some items before checkout.", "error");
      return;
    }
    
    addToast("Proceeding to checkout...", "success");
    router.push('/checkout');
  };

  // Remove artificial loading state to prevent flickering
  // Cart should display immediately from Zustand state
  // if (isLoading) {
  //   return (
  //     <div className="bg-white rounded-lg shadow-sm p-6">
  //       <div className="flex items-center justify-center">
  //         <div className="w-6 h-6 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
  //         <span className="ml-2 text-gray-600">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      {/* Promo Code - Moved to top */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Have a promo code?</h3>
        
        {appliedPromo ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">
                Promo code <strong>{appliedPromo}</strong> applied
              </span>
              <button
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <button
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isApplyingPromo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'CODE'
              )}
            </button>
          </div>
        )}
        
        {/* Promo Code Hint */}
        <p className="text-xs text-gray-500 mt-2">
          Try <strong>WELCOME10</strong> for 10% off your first order
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
        
        {/* Items Count */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">{orderSummary.itemCount} Items</span>
          <span className="font-medium text-gray-900">{formatPrice(orderSummary.subtotal)}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {orderSummary.shipping === 0 ? 'Free' : formatPrice(orderSummary.shipping)}
          </span>
        </div>
        
        {/* Savings */}
        {orderSummary.savings > 0 && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">You save</span>
            <span className="font-medium text-green-600">{formatPrice(orderSummary.savings)}</span>
          </div>
        )}
        
        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>
        
        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900">Subtotal</span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(orderSummary.total)}</span>
        </div>
        
        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={orderSummary.itemCount === 0}
          className="w-full py-4 bg-[#D4AF37] cursor-pointer text-black font-bold rounded-lg hover:bg-[#B8941F] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {orderSummary.itemCount === 0 ? 'Cart is Empty' : 'PROCEED TO CHECKOUT'}
        </button>
      </div>

      {/* Toast notifications are now handled globally by ToastContainer */}
    </div>
  );
}
