'use client';

import React, { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import useToast from '@/hooks/use-toast';

export default function CheckoutSection() {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { addToast, toasts, setToasts } = useToast();
  const router = useRouter();
  
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          className="w-full py-4 bg-[#fdc713] text-black font-bold rounded-lg hover:bg-[#f0c000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {orderSummary.itemCount === 0 ? 'Cart is Empty' : 'PROCEED TO CHECKOUT'}
        </button>
      </div>

      {/* Promo Code */}
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <button
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || !promoCode.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingPromo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'APPLY CODE'
              )}
            </button>
          </div>
        )}
        
        {/* Promo Code Hint */}
        <p className="text-xs text-gray-500 mt-2">
          Try <strong>WELCOME10</strong> for 10% off your first order
        </p>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Free shipping on orders over ₦50,000</p>
          <p>• 30-day return policy</p>
          <p>• Secure checkout with SSL encryption</p>
          <p>• Customer support available 24/7</p>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg text-white max-w-sm flex items-center gap-3 relative overflow-hidden ${
              toast.type === "success"
                ? "bg-[#fdc713] text-black"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : toast.type === "error" ? (
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-gray-600 hover:text-gray-800 text-lg font-bold flex-shrink-0"
            >
              ×
            </button>
            
            {/* Running line animation */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
              <div className="h-full bg-white/60 animate-[progress_3s_linear_forwards]"></div>
              <style jsx>{`
                @keyframes progress {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
