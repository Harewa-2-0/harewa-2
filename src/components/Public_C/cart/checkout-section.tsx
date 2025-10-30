'use client';

import React, { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toast-context';
import { createOrderFromCart } from '@/services/order';
import PendingOrderModal from '@/components/common/pending-order-modal';

export default function CheckoutSection() {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showPendingOrderModal, setShowPendingOrderModal] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  
  // Order store state
  const { fetchPendingOrder, pendingOrder, setCurrentOrder } = useOrderStore();
  
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);

  // Debug: Log when pendingOrder or modal state changes
  React.useEffect(() => {
    console.log('[CheckoutSection] pendingOrder:', pendingOrder);
    console.log('[CheckoutSection] showPendingOrderModal:', showPendingOrderModal);
  }, [pendingOrder, showPendingOrderModal]);

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

  const handleCheckout = async () => {
    if (isCreatingOrder) return;
    
    if (orderSummary.itemCount === 0) {
      addToast("Your cart is empty. Add some items before checkout.", "error");
      return;
    }
    
    try {
      setIsCreatingOrder(true);

      // Check for pending orders first
      console.log('[Checkout] Checking for pending orders...');
      const existingPendingOrder = await fetchPendingOrder();
      console.log('[Checkout] Pending order result:', existingPendingOrder);
      console.log('[Checkout] Pending order from store:', pendingOrder);
      
      if (existingPendingOrder) {
        // FIXED: Show modal instead of navigating directly
        console.log('[Checkout] Found pending order, showing modal');
        setCurrentOrder(existingPendingOrder);
        setShowPendingOrderModal(true);
        setIsCreatingOrder(false);
        console.log('[Checkout] Modal state set to:', true);
        return;
      }
      
      console.log('[Checkout] No pending order, creating new one...');

      // No pending order, proceed with creating new order
      const result = await createOrderFromCart();
      const errMsg = (result.error || '').toLowerCase();

      if (result.success && result.order) {
        console.log('[Checkout] New order created:', result.order);
        // CRITICAL: Set the new order as current order before navigation
        setCurrentOrder(result.order);
        
        // Wait for store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        addToast('Order created successfully! Please complete payment to confirm your order.', 'success');
        router.push('/checkout');
        return;
      }

      if (result.errorCode === 'NO_ADDRESS' || errMsg.includes('no delivery address')) {
        addToast('Add a delivery address to your profile before checkout', 'error');
        router.push('/profile');
        return;
      }

      if (
        result.errorCode === 'DUPLICATE_ORDER' ||
        errMsg.includes('already exists') ||
        errMsg.includes('exists for this cart')
      ) {
        console.log('[Checkout] Duplicate order detected, fetching existing order...');
        // Fetch the existing pending order
        const existingOrder = await fetchPendingOrder();
        console.log('[Checkout] Fetched existing order:', existingOrder);
        
        // Also check all orders to debug
        const { allOrders } = useOrderStore.getState();
        console.log('[Checkout] All orders in store:', allOrders);
        console.log('[Checkout] Number of orders:', allOrders.length);
        if (allOrders.length > 0) {
          console.log('[Checkout] First order status:', allOrders[0].status);
          console.log('[Checkout] First order details:', allOrders[0]);
        }
        
        if (existingOrder) {
          setCurrentOrder(existingOrder);
          
          // Wait a tick to ensure store is updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          addToast('Continuing with existing order', 'info');
          router.push('/checkout');
        } else if (allOrders.length > 0) {
          // If we have orders but no "pending" ones, use the most recent one
          const mostRecentOrder = allOrders[0];
          console.log('[Checkout] No pending order found, using most recent:', mostRecentOrder);
          setCurrentOrder(mostRecentOrder);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          addToast('Continuing with existing order', 'info');
          router.push('/checkout');
        } else {
          addToast('Order already exists but could not be found. Please try again.', 'error');
        }
        return;
      }

      // Special-case generic 400s that surface as "Bad Request" (treat like duplicate)
      if (errMsg === 'bad request') {
        console.log('[Checkout] Bad request (likely duplicate), fetching existing order...');
        
        // Debug: Call the API directly to see raw response
        try {
          const { getMyOrders } = await import('@/services/order');
          const rawOrders = await getMyOrders();
          console.log('[Checkout] Raw orders from API:', rawOrders);
        } catch (e) {
          console.error('[Checkout] Failed to fetch orders directly:', e);
        }
        
        // Fetch the existing pending order
        const existingOrder = await fetchPendingOrder();
        console.log('[Checkout] Fetched existing order:', existingOrder);
        
        // Also check all orders to debug
        const { allOrders } = useOrderStore.getState();
        console.log('[Checkout] All orders in store:', allOrders);
        console.log('[Checkout] Number of orders:', allOrders.length);
        if (allOrders.length > 0) {
          console.log('[Checkout] First order status:', allOrders[0].status);
          console.log('[Checkout] First order details:', allOrders[0]);
        }
        
        if (existingOrder) {
          setCurrentOrder(existingOrder);
          
          // Wait a tick to ensure store is updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          addToast('Continuing with existing order', 'info');
          router.push('/checkout');
        } else if (allOrders.length > 0) {
          // If we have orders but no "pending" ones, use the most recent one
          const mostRecentOrder = allOrders[0];
          console.log('[Checkout] No pending order found, using most recent:', mostRecentOrder);
          setCurrentOrder(mostRecentOrder);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          addToast('Continuing with existing order', 'info');
          router.push('/checkout');
        } else {
          addToast('Order already exists but could not be found. Please try again.', 'error');
        }
        return;
      }

      // Generic failure: prefer server message; fall back to network message
      if (result.errorCode === 'NETWORK_ERROR') {
        addToast('Order failed. Check your network and try again.', 'error');
      } else if (result.error && result.error.trim().length > 0) {
        addToast(result.error, 'error');
      } else {
        addToast('Order failed. Check your network and try again.', 'error');
      }
      return;

    } catch (error) {
      console.error('Checkout error:', error);
      addToast('Order failed. Check your network and try again.', 'error');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Modal handlers
  const handleContinueWithPendingOrder = () => {
    if (pendingOrder) {
      setCurrentOrder(pendingOrder);
      setShowPendingOrderModal(false);
      addToast('Continuing with existing order', 'info');
      router.push('/checkout');
    }
  };

  const handleStartNewOrder = async () => {
    // Modal has already deleted the pending order
    // Now create a new order from current cart
    console.log('[CheckoutSection] Creating new order after pending order deletion...');
    setIsCreatingOrder(true);
    
    try {
      // Create new order (pending order already deleted by modal)
      const result = await createOrderFromCart();
      const errMsg = (result.error || '').toLowerCase();

      if (result.success && result.order) {
        console.log('[CheckoutSection] New order created:', result.order);
        // CRITICAL: Set the new order as current order before navigation
        setCurrentOrder(result.order);
        
        // Wait for store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        addToast('New order created successfully!', 'success');
        router.push('/checkout');
        return;
      }

      // Handle errors
      if (result.errorCode === 'NO_ADDRESS' || errMsg.includes('no delivery address')) {
        addToast('Add a delivery address to your profile before checkout', 'error');
        router.push('/profile');
        return;
      }

      if (result.errorCode === 'NETWORK_ERROR') {
        addToast('Order failed. Check your network and try again.', 'error');
      } else if (result.error && result.error.trim().length > 0) {
        addToast(result.error, 'error');
      } else {
        addToast('Failed to create new order', 'error');
      }
    } catch (error) {
      console.error('Error creating new order:', error);
      addToast('Failed to create new order', 'error');
    } finally {
      setIsCreatingOrder(false);
    }
  };

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
          disabled={orderSummary.itemCount === 0 || isCreatingOrder}
          className="w-full py-4 bg-[#D4AF37] cursor-pointer text-black font-bold rounded-lg hover:bg-[#B8941F] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isCreatingOrder ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
              PROCESSING...
            </div>
          ) : orderSummary.itemCount === 0 ? (
            'Cart is Empty'
          ) : (
            'PROCEED TO CHECKOUT'
          )}
        </button>
      </div>
      
      {/* Pending Order Modal - Only render if pendingOrder exists */}
      {pendingOrder && (
        <PendingOrderModal
          isOpen={showPendingOrderModal}
          onClose={() => setShowPendingOrderModal(false)}
          onContinue={handleContinueWithPendingOrder}
          onStartNew={handleStartNewOrder}
          pendingOrder={pendingOrder}
        />
      )}
    </div>
  );
}