'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profile-store';
import { useRouter } from 'next/navigation';
import AddressSection from '@/components/Public_C/checkout/address-section';
import CartSummary from '@/components/Public_C/checkout/cart-summary';
import PaymentMethods from '@/components/Public_C/checkout/payment-methods';
import type { ProfileAddress } from '@/store/profile-store';

export default function CheckoutPage() {
  const { isAuthenticated, hasHydratedAuth } = useAuthStore();
  const { items } = useCartStore();
  const { profileData, fetchProfile } = useProfileStore();
  const router = useRouter();
  
  const [selectedAddress, setSelectedAddress] = useState<ProfileAddress | undefined>();
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (hasHydratedAuth && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, hasHydratedAuth, router]);

  // Fetch profile data (addresses) when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // Auto-select address when profile data is available
  useEffect(() => {
    if (profileData?.addresses && profileData.addresses.length > 0) {
      const defaultAddr = profileData.addresses.find(addr => addr.isDefault);
      const firstAddr = profileData.addresses[0];
      
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setIsAddressValid(true);
      } else if (firstAddr) {
        setSelectedAddress(firstAddr);
        setIsAddressValid(true);
      }
    }
  }, [profileData?.addresses]);

  // Redirect if no items in cart
  useEffect(() => {
    if (hasHydratedAuth && isAuthenticated && items.length === 0) {
      router.push('/cart');
    }
  }, [hasHydratedAuth, isAuthenticated, items, router]);

  // Show loading while auth is hydrating
  if (!hasHydratedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to cart...</p>
        </div>
      </div>
    );
  }

  const handleAddressSelect = (address: ProfileAddress) => {
    setSelectedAddress(address);
    setIsAddressValid(true);
  };

  const handleAddressChange = () => {
    // Trigger recalculation of shipping/taxes/prices
    // This will be implemented in the next step
    console.log('Address changed, recalculating totals...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Home</a>
            <span>/</span>
            <a href="/cart" className="hover:text-gray-700">Cart</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Address Section */}
          <div className="lg:col-span-2">
            <AddressSection
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              onAddressChange={handleAddressChange}
            />
          </div>
          
          {/* Right Side - Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
        
        {/* Bottom - Payment Methods */}
        <div className="mt-8">
          <PaymentMethods isEnabled={isAddressValid} />
        </div>
      </div>
    </div>
  );
}
