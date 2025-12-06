"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCartTotalItemsOptimistic } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/contexts/toast-context";
import { useUpdateCartQuantityMutation, useRemoveFromCartMutation, useCartRawQuery } from "@/hooks/useCart";
import { usePendingOrderQuery } from "@/hooks/useOrders";
import { formatPrice } from "@/utils/currency";
import { AlertCircle } from "lucide-react";
import { CartItem } from "./CartItem";

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

  // Size selector popover state
  const [sizePopover, setSizePopover] = useState<{
    itemId: string;
    mode: 'increase' | 'decrease';
  } | null>(null);

  // React Query hook for pending order warning
  const { hasPendingOrder } = usePendingOrderQuery();

  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const isGuestCart = useCartStore((s) => s.isGuestCart);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);
  const updateQuantityLocal = useCartStore((s) => s.updateQuantity);
  const updateSizeQuantityLocal = useCartStore((s) => s.updateSizeQuantity);
  const removeItemLocal = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCartId = useCartStore((s) => s.setCartId);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // React Query mutations for cart operations
  const updateCartMutation = useUpdateCartQuantityMutation();
  const removeCartMutation = useRemoveFromCartMutation();
  // Optimized: Only fetch when authenticated, with proper caching to prevent constant refetches
  const { data: rawCart } = useCartRawQuery(isAuthenticated, {
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh, no refetch
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)
    refetchOnMount: false, // Don't refetch when cart opens
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Set cartId from rawCart when it loads
  useEffect(() => {
    if (rawCart && isAuthenticated) {
      const id = (rawCart as any)._id || (rawCart as any).id;
      if (id) {
        setCartId(id);
      }
    }
  }, [rawCart, isAuthenticated, setCartId]);

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

  const subtotal = useMemo(() => {
    return uniqueItems.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [uniqueItems]);

  // Clear toasts when cart opens (consolidated with cart open logic)
  useEffect(() => {
    if (isOpen) {
      clearToasts();
      console.log('[Cart] Drawer opened - toasts cleared');
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

      if (window.__scrollLockCount > 1) return;

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

      if (window.__scrollLockCount > 0) return;

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

  // Handle quantity change - shows popover if multiple sizes exist or multiple available sizes
  const handleQuantityChange = (id: string, mode: 'increase' | 'decrease', showPopover: boolean = false) => {
    if (pendingOperations.has(id)) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    // If should show popover, show it to let user choose size
    if (showPopover) {
      setSizePopover({ itemId: id, mode });
      return;
    }

    // Single size or no breakdown - update directly
    const newQty = mode === 'increase' ? item.quantity + 1 : Math.max(0, item.quantity - 1);
    onChangeQty(id, newQty);
  };

  // Handle size-specific quantity change (from popover)
  const onChangeSizeQty = async (id: string, size: string, qty: number) => {
    console.log('[CartUI] onChangeSizeQty called', { id, size, qty, isPending: pendingOperations.has(id) });

    if (pendingOperations.has(id)) {
      console.warn('[CartUI] Operation blocked by pendingOperations', id);
      return;
    }

    try {
      setPendingOperations(prev => new Set(prev).add(id));

      // Update local state immediately (optimistic)
      console.log('[CartUI] calling updateSizeQuantityLocal');
      updateSizeQuantityLocal(id, size, qty);

      // Sync to server if authenticated
      if (isAuthenticated && cartId) {
        try {
          // IMPORTANT: Get FRESH state after local update
          const freshItems = useCartStore.getState().items;
          const updatedItem = freshItems.find(i => i.id === id);

          await updateCartMutation.mutateAsync({
            cartId,
            productId: id,
            quantity: updatedItem?.quantity || qty,
            currentItems: freshItems, // Use fresh items with updated productNote
          });
        } catch (serverError) {
          console.error('Failed to update quantity on server:', serverError);
          addToast("Failed to update quantity on server. Changes may not be saved.", "error");
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

  const onChangeQty = async (id: string, qty: number) => {
    if (pendingOperations.has(id)) return;

    try {
      setPendingOperations(prev => new Set(prev).add(id));

      // Update local state immediately (optimistic)
      updateQuantityLocal(id, qty);

      // Sync to server if authenticated
      if (isAuthenticated && cartId) {
        try {
          // IMPORTANT: Get FRESH state after local update
          const freshItems = useCartStore.getState().items;

          await updateCartMutation.mutateAsync({
            cartId,
            productId: id,
            quantity: qty,
            currentItems: freshItems, // Use fresh items with updated productNote
          });
        } catch (serverError) {
          console.error('Failed to update quantity on server:', serverError);
          addToast("Failed to update quantity on server. Changes may not be saved.", "error");
          // React Query will handle rollback if mutation fails
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
      // Update local state immediately (optimistic)
      removeItemLocal(id);
      addToast("Item removed from cart", "success");

      // Sync to server if authenticated
      if (isAuthenticated && cartId) {
        try {
          await removeCartMutation.mutateAsync({ cartId, productId: id });
        } catch (serverError) {
          console.error('Failed to remove item from server:', serverError);
          addToast("Failed to remove item from server. Changes may not be saved.", "error");
          // React Query will handle rollback if mutation fails
        }
      }
    } catch (error) {
      addToast("Failed to remove item. Please try again.", "error");
      console.error("Failed to remove item:", error);
    }
  };

  const onClearCart = async () => {
    try {
      clearCart();
      addToast("Cart cleared successfully", "success");

      // For logged-in users, clearing is handled by updating cart to empty on server
      // This will be implemented when clear cart button is added
    } catch (error) {
      addToast("Failed to clear cart. Please try again.", "error");
      console.error("Failed to clear cart:", error);
    }
  };

  // Instant navigation - order creation moved to checkout page
  const handleCheckout = () => {
    if (uniqueItems.length === 0) {
      addToast("Your cart is empty. Add some items before checkout.", "error");
      return;
    }

    // Auth gate first
    if (!isAuthenticated) {
      addToast('Please sign in or create an account to checkout', 'error');
      setIsOpen?.(false);
      router.push('/signin');
      return;
    }

    // Navigate immediately - order will be created on payment
    setIsOpen?.(false);
    router.push('/checkout');
  };

  if (!isOpen) return null;

  const cartDrawer = (
    <div className="fixed inset-0 z-[99999]" style={{ zIndex: 99999 }}>
      {/* Overlay */}
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 py-1">
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
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                <Image
                  src="/unauthorized.png"
                  alt="Empty Cart"
                  width={128}
                  height={128}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
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
              {/* Pending Order Warning Banner */}
              {hasPendingOrder && (
                <div className="mx-6 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
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
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

              {/* Cart Summary */}
              <div className="border-t border-gray-200 p-6 space-y-4">
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
                  <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={uniqueItems.length === 0}
                    className="w-full bg-[#D4AF37] text-black font-medium py-3 px-4 rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CHECKOUT
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

  return typeof window !== 'undefined'
    ? createPortal(cartDrawer, document.body)
    : null;
};

export default CartUI;