'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/contexts/toast-context';
import CartItems from '@/components/Public_C/cart/cart-items';
import CheckoutSection from '@/components/Public_C/cart/checkout-section';

export default function CartPage() {
  // Only need hydration status now; middleware handles auth redirects
  const { hasHydratedAuth, isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const { addToast } = useToast();

  // Show toast notification for unauthenticated users (though middleware will redirect)
  useEffect(() => {
    if (hasHydratedAuth && !isAuthenticated) {
      addToast('Login or create account to view cart', 'error');
    }
  }, [hasHydratedAuth, isAuthenticated, addToast]);

  // Show loader while Zustand stores hydrate (optional but nice)
  if (!hasHydratedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin" />
      </div>
    );
  }

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">My cart</span>
          </nav> */}
          <h1 className="text-3xl font-bold text-gray-900 mt-2">My Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - 2/3 */}
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            {/* Checkout - 1/3 */}
            <div className="lg:col-span-1">
              <CheckoutSection />
            </div>
          </div>
        ) : (
          // Empty state handled inside CartItems; take full width
          <div className="w-full">
            <CartItems />
          </div>
        )}
      </div>
    </div>
  );
}
