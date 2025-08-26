'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CartItems from '@/components/Public_C/cart/cart-items';
import CheckoutSection from '@/components/Public_C/cart/checkout-section';

export default function CartPage() {
  const { isAuthenticated, hasHydratedAuth } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (hasHydratedAuth && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, hasHydratedAuth, router]);

  // Show loading while auth is hydrating
  if (!hasHydratedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">My cart</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">My Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Takes 2/3 of the space */}
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            
            {/* Checkout Section - Takes 1/3 of the space */}
            <div className="lg:col-span-1">
              <CheckoutSection />
            </div>
          </div>
        ) : (
          /* When no items, CartItems will show empty state and take full width */
          <div className="w-full">
            <CartItems />
          </div>
        )}
      </div>
    </div>
  );
}
