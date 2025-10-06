"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCartTotalItems, useCartTotalItemsOptimistic } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useToast } from "@/contexts/toast-context";
import { createOrderFromCart } from "@/services/order";
import PendingOrderModal from "@/components/common/pending-order-modal";

interface CartUIProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

declare global {
  interface Window {
    __scrollLockCount?: number;
    __scrollLockPrev?: {
      htmlOverflow?: string;
      bodyOverflow?: string;
      htmlOverscroll?: string;
      bodyOverscroll?: string;
      bodyTouchAction?: string;
    };
  }
}

const CartUI = ({ isOpen = true, setIsOpen }: CartUIProps) => {
  const router = useRouter();
  const { addToast, clearToasts } = useToast();
  
  // Track pending operations per product to prevent double-submit
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Track order creation state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // Order store state
  const { fetchPendingOrder, pendingOrder, setCurrentOrder } = useOrderStore();
  const [showPendingOrderModal, setShowPendingOrderModal] = useState(false);
  
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const isGuestCart = useCartStore((s) => s.isGuestCart);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const syncToServer = useCartStore((s) => s.syncToServer);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Remove automatic cart fetching on drawer open to prevent flickering
  // Cart data should already be available from Zustand state

  // Remove artificial loading state to prevent flickering
  // Cart should display immediately from Zustand state

  // Removed window focus refresh to prevent unnecessary API calls

  // Prevent any automatic cart fetching while drawer is open
  useEffect(() => {
    if (isOpen) {
      // Disable any automatic cart fetching while drawer is open
      // This prevents the GET request from running before DELETE
      console.log('Cart drawer opened - preventing automatic fetches');
    }
  }, [isOpen]);

  // Items should already be deduplicated by the cartStore
  const uniqueItems = useMemo(() => {
    const productMap = new Map<string, typeof items[0]>();
    
    items.forEach((item) => {
      if (!item || !item.id) return;
      
      const productId = String(item.id);
      // If item already exists, keep the existing one (don't add quantities)
      if (!productMap.has(productId)) {
        productMap.set(productId, { ...item });
      }
    });
    
    return Array.from(productMap.values());
  }, [items]);

  // Use optimistic counter for smooth UX during merge/refresh
  const totalItems = useCartTotalItemsOptimistic();

  const subtotal = useMemo(() => {
    return uniqueItems.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [uniqueItems]);

  // Clear all toasts when cart opens to prevent spam
  useEffect(() => {
    if (isOpen) {
      clearToasts();
    }
  }, [isOpen, clearToasts]);

  // Show error toasts when cart errors occur
  useEffect(() => {
    if (error) {
      addToast(error, "error");
    }
  }, [error, addToast]);

  // Scroll lock management
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const lock = () => {
      if (typeof window === "undefined") return;
      
      if (!window.__scrollLockCount) {
        window.__scrollLockCount = 0;
      }
      
      if (window.__scrollLockCount > 1) return; // already locked elsewhere
      
      window.__scrollLockCount++;
      
      if (window.__scrollLockCount === 1) {
        window.__scrollLockPrev = {
          htmlOverflow: html.style.overflow,
          bodyOverflow: body.style.overflow,
          htmlOverscroll: (html.style as any).overscrollBehavior,
          bodyOverscroll: (body.style as any).overscrollBehavior,
          bodyTouchAction: (body.style as any).touchAction,
        };
        
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        (html.style as any).overscrollBehavior = "none";
        (body.style as any).overscrollBehavior = "none";
        (body.style as any).touchAction = "none";
      }
    };

    const unlock = () => {
      if (typeof window === "undefined") return;
      
      if (!window.__scrollLockCount) return;
      
      window.__scrollLockCount--;
      
      if (window.__scrollLockCount > 0) return; // still in use by another modal
      
      const prev = window.__scrollLockPrev;
      if (prev) {
        html.style.overflow = prev.htmlOverflow ?? "";
        body.style.overflow = prev.bodyOverflow ?? "";
        (html.style as any).overscrollBehavior = prev.htmlOverscroll ?? "";
        (body.style as any).overscrollBehavior = prev.bodyOverscroll ?? "";
        (body.style as any).touchAction = prev.bodyTouchAction ?? "";
        window.__scrollLockPrev = undefined;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen?.(false);
    };
    window.addEventListener("keydown", onKey);

    if (isOpen) lock();
    else unlock();

    return () => {
      window.removeEventListener("keydown", onKey);
      if (isOpen) unlock();
    };
  }, [isOpen, setIsOpen]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const onChangeQty = async (id: string, qty: number) => {
    if (pendingOperations.has(id)) return;
    
    try {
      setPendingOperations(prev => new Set(prev).add(id));
      
      // Update local state immediately for optimistic UI
      updateQuantity(id, qty);
      
      // Quantity updated - no toast notification needed
      
      // Sync to server in background if authenticated
      if (isAuthenticated && cartId) {
        try {
          // Use the truly optimistic UPDATE endpoint that uses local state
          const { updateProductQuantityOptimistic } = await import('@/services/cart');
          await updateProductQuantityOptimistic(cartId, id, qty, items);
          // Don't refetch cart - trust the update operation succeeded
        } catch (serverError) {
          console.error('Failed to update quantity on server:', serverError);
          // Revert the local state on server error
          addToast("Failed to update quantity on server. Please try again.", "error");
          // Revert to server state by refetching cart
          await fetchCart();
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

  const onClearCart = async () => {
    try {
      // Update local state immediately
      clearCart();
      
      // Sync to server if authenticated
      if (isAuthenticated) {
        await syncToServer();
      }
      
      addToast("Cart cleared successfully", "success");
    } catch (error) {
      addToast("Failed to clear cart. Please try again.", "error");
      console.error("Failed to clear cart:", error);
    }
  };

  const handleCheckout = async () => {
    if (isCreatingOrder) return;
    
    try {
      setIsCreatingOrder(true);

      // Auth gate first
      if (!isAuthenticated) {
        addToast('Please sign in or create an account to checkout', 'error');
        setIsOpen?.(false);
        router.push('/signin');
        return;
      }

      // Check for pending orders first
      const existingPendingOrder = await fetchPendingOrder();
      
      if (existingPendingOrder) {
        // Show modal for pending order
        setShowPendingOrderModal(true);
        setIsCreatingOrder(false);
        return;
      }

      // No pending order, proceed with creating new order
      const result = await createOrderFromCart();
      const errMsg = (result.error || '').toLowerCase();

      if (result.success) {
        addToast('Order created successfully! Please complete payment to confirm your order.', 'success');
        setIsOpen?.(false);
        router.push('/checkout');
        return;
      }

      // Error handling by code/message
      if (result.errorCode === 'NO_ADDRESS' || errMsg.includes('no delivery address')) {
        addToast('Add a delivery address to your profile before checkout', 'error');
        setIsOpen?.(false);
        router.push('/profile');
        return;
      }

      if (
        result.errorCode === 'DUPLICATE_ORDER' ||
        errMsg.includes('already exists') ||
        errMsg.includes('exists for this cart')
      ) {
        addToast('Order already exists for this cart. Proceeding to payment.', 'error');
        setIsOpen?.(false);
        router.push('/checkout');
        return;
      }

      // Special-case generic 400s that surface as "Bad Request" (treat like duplicate)
      if (errMsg === 'bad request') {
        addToast('Order already exists for this cart. Proceeding to payment.', 'error');
        setIsOpen?.(false);
        router.push('/checkout');
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
      setIsOpen?.(false);
      setShowPendingOrderModal(false);
      router.push('/checkout');
    }
  };

  const handleStartNewOrder = () => {
    // This will be handled by the modal component
    setIsOpen?.(false);
    setShowPendingOrderModal(false);
  };

  if (!isOpen) return null;

  // Use portal to render at root level to avoid stacking context issues
  const cartDrawer = (
    <div className="fixed inset-0 z-[99999]" style={{ zIndex: 99999 }}>
      {/* Overlay: subtle dark, click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen?.(false)}
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
        style={{ zIndex: 100000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black uppercase tracking-wide">
            MY CART
          </h2>
          <button
            onClick={() => setIsOpen?.(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {uniqueItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              {/* Illustration */}
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                <Image
                  src="/unauthorized.png"
                  alt="Empty Cart"
                  width={128}
                  height={128}
                  className=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  priority
                />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <button
                onClick={() => setIsOpen?.(false)}
                className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                  {uniqueItems.map((item) => {
                    const name = item.name || 'Product Name';
                    const image = item.image || '/placeholder.png';
                    const itemPrice = typeof item.price === 'number' ? item.price : 0;
                    const itemTotal = itemPrice * item.quantity;
                    const originalPrice = itemPrice * 1.75; // Mock original price (75% higher)
                    const savings = originalPrice - itemTotal;
                    const isPending = pendingOperations.has(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                              {name}
                            </h3>

                            {/* Pricing */}
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-red-600">
                                  {formatPrice(itemPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(originalPrice)}
                                </span>
                              </div>
                            </div>

                            {/* Size */}
                            <div className="mb-3">
                              <span className="text-xs text-gray-600">Size: M</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onChangeQty(item.id, Math.max(0, item.quantity - 1))}
                                  disabled={isPending}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={14} className="text-gray-600" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onChangeQty(item.id, item.quantity + 1)}
                                  disabled={isPending}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={14} className="text-gray-600" />
                                </button>
                              </div>

                              {/* Remove Button - Dustbin */}
                              <button
                                onClick={() => onRemove(item.id)}
                                className="w-8 h-8 border border-red-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                                aria-label="Remove item"
                                title="Remove item from cart"
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Guest User Notice */}
                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-800">
                        Guest User
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Sign in to save your cart and checkout
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
                  <span className="text-lg font-bold text-red-600">{formatPrice(subtotal)}</span>
                </div>

                {/* Calculate total savings */}
                {(() => {
                  const totalOriginalPrice = uniqueItems.reduce((total, item) => {
                    const itemPrice = typeof item.price === 'number' ? item.price : 0;
                    const originalPrice = itemPrice * 1.75;
                    return total + (originalPrice * item.quantity);
                  }, 0);
                  const totalSavings = totalOriginalPrice - subtotal;
                  
                  return totalSavings > 0 ? (
                    <div className="flex justify-end">
                      <span className="text-sm font-medium text-red-600">
                        You save {formatPrice(totalSavings)}
                      </span>
                    </div>
                  ) : null;
                })()}

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCreatingOrder || uniqueItems.length === 0}
                    className="w-full bg-[#D4AF37] text-black font-medium py-3 px-4 rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingOrder ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        PROCESSING...
                      </div>
                    ) : (
                      'CHECKOUT'
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        addToast('Please sign in or create an account to view your cart', 'error');
                        setIsOpen?.(false);
                        router.push('/signin');
                        return;
                      }
                      setIsOpen?.(false);
                      router.push('/cart');
                    }}
                    className="w-full bg-white text-black font-medium py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    VIEW CART
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );

  // Render using portal to ensure it's at the root level
  return typeof window !== 'undefined' 
    ? createPortal(
        <>
          {cartDrawer}
          {pendingOrder && (
            <PendingOrderModal
              isOpen={showPendingOrderModal}
              onClose={() => setShowPendingOrderModal(false)}
              onContinue={handleContinueWithPendingOrder}
              onStartNew={handleStartNewOrder}
              pendingOrder={pendingOrder}
            />
          )}
        </>,
        document.body
      )
    : null;
};

export default CartUI;