"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartTotalItems } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import useToast from "@/hooks/use-toast";
import { addToMyCart, removeProductFromCartNew } from "@/services/cart";

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
  const { addToast, toasts, setToasts } = useToast();
  
  // Optimistic state for cart clearing
  const [isClearingCart, setIsClearingCart] = useState(false);
  // Loading state when cart drawer opens
  const [isCartLoading, setIsCartLoading] = useState(false);
  // Track pending operations per product to prevent double-submit
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const isGuestCart = useCartStore((s) => s.isGuestCart);
  const lastSyncedAt = useCartStore((s) => s.lastSyncedAt);
  const updateQuantityAndSync = useCartStore((s) => s.updateQuantityAndSync);
  const removeItemAndSync = useCartStore((s) => s.removeItemAndSync);
  const clearCartAndSync = useCartStore((s) => s.clearCartAndSync);
  const clearCart = useCartStore((s) => s.clearCart);
  const isLoading = useCartStore((s) => s.isLoading);
  const error = useCartStore((s) => s.error);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Use optimistic items when clearing cart
  const displayItems = isClearingCart ? [] : items;

  // Force refresh cart when drawer opens to ensure UI shows current server state
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      // Use centralized hydration method with force: true to ensure fresh data
      useCartStore.getState().ensureHydrated(true);
    }
  }, [isOpen, isAuthenticated]);

  // Show loading spinner when cart opens - NO FETCHING HERE
  useEffect(() => {
    if (isOpen && !isCartLoading) {
      setIsCartLoading(true);
      
      // Simulate loading time for better UX - no server calls
      setTimeout(() => setIsCartLoading(false), 800);
    }
  }, [isOpen, isCartLoading]);

  // Throttled window focus refresh - uses centralized method with TTL
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && cartId) {
        // Use centralized hydration method with TTL throttling (force: false)
        useCartStore.getState().ensureHydrated(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, cartId]);

  // Ensure items are deduplicated before rendering to prevent React key warnings
  const uniqueItems = useMemo(() => {
    const productMap = new Map<string, typeof displayItems[0]>();
    
    displayItems.forEach((item) => {
      if (!item || !item.id) return;
      
      const productId = String(item.id);
      if (productMap.has(productId)) {
        // Product already exists - merge quantities
        const existing = productMap.get(productId)!;
        productMap.set(productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          // Keep the first price encountered
          price: existing.price ?? item.price,
        });
      } else {
        // New product - add to map
        productMap.set(productId, { ...item });
      }
    });
    
    return Array.from(productMap.values());
  }, [displayItems]);

  // Calculate total items from unique items to avoid counting duplicates
  const totalItems = useMemo(() => {
    return uniqueItems.reduce((total, item) => total + item.quantity, 0);
  }, [uniqueItems]);

  const subtotal = useMemo(() => {
    return uniqueItems.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [uniqueItems]);

  useEffect(() => {
    // Cart hydration is now handled by the CartHydration component
    // and the new sync functions in the cart store
  }, []);

  // Show error toasts when cart errors occur
  useEffect(() => {
    if (error) {
      addToast(error, "error");
    }
  }, [error, addToast]);

  // Show success toast when cart is loaded with items
  useEffect(() => {
    if (items.length > 0 && !isLoading && !isClearingCart && lastSyncedAt) {
      // Only show toast when items are first loaded, not on every render
      const hasShownToast = sessionStorage.getItem('cartLoadedToast');
      if (!hasShownToast) {
        addToast(`Cart loaded with ${items.length} item${items.length === 1 ? '' : 's'}`, "success");
        sessionStorage.setItem('cartLoadedToast', 'true');
      }
    }
  }, [items.length, isLoading, isClearingCart, lastSyncedAt, addToast]);

  // Show success toast when cart is successfully synced
  useEffect(() => {
    if (lastSyncedAt && !isLoading && !isClearingCart) {
      // Only show sync success toast once per session
      const hasShownSyncToast = sessionStorage.getItem('cartSyncToast');
      if (!hasShownSyncToast && items.length > 0) {
        addToast("Cart synchronized successfully", "success");
        sessionStorage.setItem('cartSyncToast', 'true');
      }
    }
  }, [lastSyncedAt, isLoading, isClearingCart, items.length, addToast]);

  // Show toast when user signs in and cart is synced
  useEffect(() => {
    if (isAuthenticated && lastSyncedAt && items.length > 0) {
      // Only show this toast once per session when user signs in
      const hasShownSignInToast = sessionStorage.getItem('cartSignInToast');
      if (!hasShownSignInToast) {
        addToast("Welcome back! Your cart has been synced.", "success");
        sessionStorage.setItem('cartSignInToast', 'true');
      }
    }
  }, [isAuthenticated, lastSyncedAt, items.length, addToast]);

  // Show toast when cart is successfully loaded from server
  useEffect(() => {
    if (!isLoading && items.length > 0 && !isClearingCart && lastSyncedAt) {
      // Only show this toast once per session when cart is loaded from server
      const hasShownServerToast = sessionStorage.getItem('cartServerToast');
      if (!hasShownServerToast) {
        addToast("Cart loaded successfully", "success");
        sessionStorage.setItem('cartServerToast', 'true');
      }
    }
  }, [isLoading, items.length, isClearingCart, lastSyncedAt, addToast]);

  // Show toast when cart is successfully synced after operations
  useEffect(() => {
    if (lastSyncedAt && !isLoading && !isClearingCart && items.length > 0) {
      // Only show this toast once per session when cart is synced
      const hasShownOpSyncToast = sessionStorage.getItem('cartOpSyncToast');
      if (!hasShownOpSyncToast) {
        addToast("Cart changes saved successfully", "success");
        sessionStorage.setItem('cartOpSyncToast', 'true');
      }
    }
  }, [lastSyncedAt, isLoading, isClearingCart, items.length, addToast]);

  // Show toast when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && !isLoading && !isClearingCart) {
      // Only show this toast when cart becomes empty, not on initial load
      const hasShownEmptyToast = sessionStorage.getItem('cartEmptyToast');
      if (!hasShownEmptyToast && items.length === 0) {
        addToast("Your cart is now empty", "info");
        sessionStorage.setItem('cartEmptyToast', 'true');
      }
    }
  }, [items.length, isLoading, isClearingCart, addToast]);

  // Show toast when items are added to cart
  useEffect(() => {
    if (items.length > 0 && !isLoading && !isClearingCart) {
      // Only show this toast when items are added, not on initial load
      const hasShownAddedToast = sessionStorage.getItem('cartAddedToast');
      if (!hasShownAddedToast && items.length > 0) {
        addToast(`Added ${items.length} item${items.length === 1 ? '' : 's'} to cart`, "success");
        sessionStorage.setItem('cartAddedToast', 'true');
      }
    }
  }, [items.length, isLoading, isClearingCart, addToast]);

  // Robust scroll lock (handles multiple modals & Strict Mode)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const lock = () => {
      window.__scrollLockCount = (window.__scrollLockCount ?? 0) + 1;
      if (window.__scrollLockCount > 1) return; // already locked elsewhere

      window.__scrollLockPrev = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        htmlOverscroll: (html.style as any).overscrollBehavior,
        bodyOverscroll: (body.style as any).overscrollBehavior,
        bodyTouchAction: (body.style as any).touchAction,
      };

      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      (html.style as any).overscrollBehavior = "contain";
      (body.style as any).overscrollBehavior = "contain";
      (body.style as any).touchAction = "none";
    };

    const unlock = () => {
      if (!window.__scrollLockCount) return;
      window.__scrollLockCount = Math.max(0, (window.__scrollLockCount ?? 1) - 1);
      if (window.__scrollLockCount > 0) return; // still in use by another modal

      const prev = window.__scrollLockPrev || {};
      html.style.overflow = prev.htmlOverflow ?? "";
      body.style.overflow = prev.bodyOverflow ?? "";
      (html.style as any).overscrollBehavior = prev.htmlOverscroll ?? "";
      (body.style as any).overscrollBehavior = prev.bodyOverscroll ?? "";
      (body.style as any).touchAction = prev.bodyTouchAction ?? "";
      window.__scrollLockPrev = undefined;
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
    // Prevent double-submit for this product
    if (pendingOperations.has(id)) return;
    
    if (isAuthenticated && cartId) {
      try {
        // Mark operation as pending
        setPendingOperations(prev => new Set(prev).add(id));
        
        // Find current item to get existing quantity
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) return;
        
        const currentQty = currentItem.quantity;
        const newQty = qty;
        
        // Don't do optimistic updates - let server be the source of truth
        if (newQty > currentQty) {
          // Increment: POST to increase quantity
          await addToMyCart({
            productId: id,
            quantity: newQty - currentQty, // Send delta
            price: currentItem.price
          });
          
          // Refresh cart from server to get accurate state
          await useCartStore.getState().ensureHydrated();
          addToast(`Quantity increased to ${newQty}`, "success");
        } else if (newQty < currentQty) {
          // Decrement: handle based on new quantity
          if (newQty === 0) {
            // Remove item completely
            await removeProductFromCartNew(cartId, id);
            addToast("Item removed from cart", "success");
          } else {
            // Decrease quantity - for now, remove and re-add with new quantity
            await removeProductFromCartNew(cartId, id);
            await addToMyCart({
              productId: id,
              quantity: newQty,
              price: currentItem.price
            });
            addToast(`Quantity decreased to ${newQty}`, "success");
          }
          
          // Refresh cart from server to get accurate state
          await useCartStore.getState().ensureHydrated();
        }
      } catch (error) {
        addToast("Failed to update quantity. Please try again.", "error");
        console.error("Failed to update quantity:", error);
        
        // Refresh cart from server to ensure consistency
        await useCartStore.getState().ensureHydrated();
      } finally {
        // Clear pending operation
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } else {
      // For guest users, just update locally
      if (qty <= 0) {
        // Remove item for guest users
        const updatedItems = items.filter(i => i.id !== id);
        useCartStore.getState().replaceCart(updatedItems);
        addToast("Item removed from cart", "success");
      } else {
        // Update quantity for guest users
        const updatedItems = items.map(i => i.id === id ? { ...i, quantity: qty } : i);
        useCartStore.getState().replaceCart(updatedItems);
        addToast(`Quantity updated to ${qty}`, "success");
      }
      addToast("Changes saved locally. Sign in to sync across devices.", "info");
    }
  };

  const onRemove = async (id: string) => {
    if (isAuthenticated && cartId) {
      try {
        // Use the new sync function
        await removeItemAndSync(id);
        addToast("Item removed from cart", "success");
      } catch (error) {
        addToast("Failed to remove item. Please try again.", "error");
        console.error("Failed to remove item:", error);
      }
    } else {
      // For guest users, remove locally
      const updatedItems = items.filter(i => i.id !== id);
      useCartStore.getState().replaceCart(updatedItems);
      addToast("Item removed from cart", "success");
      addToast("Changes saved locally. Sign in to sync across devices.", "info");
    }
  };

  const onClearAll = async () => {
    if (isClearingCart) return;
    
    setIsClearingCart(true);
    
    try {
      console.log('🔄 Starting clear cart process...');
      console.log('📦 Current cart items:', items);
      console.log('🆔 Current cart ID:', cartId);
      
      // Clear cart using centralized method
      await clearCartAndSync();
      
      console.log('✅ Cart cleared successfully on server');
      
      // Show success toast
      addToast("Cart cleared successfully", "success");
      
      // Force refresh from server to ensure UI consistency
      await useCartStore.getState().ensureHydrated();
      
      console.log('🔄 Forced cart refresh after clear');
      
      // Small delay to ensure UI has time to reflect changes
      setTimeout(() => setIsClearingCart(false), 500);
      
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      
      // Show error toast
      addToast("Error clearing cart", "error");
      
      // Force refresh from server to ensure UI consistency
      await useCartStore.getState().ensureHydrated();
      
      console.log('🔄 Forced cart refresh after clear error');
      
      setIsClearingCart(false);
    }
  };

  const handleCheckout = () => {
    if (displayItems.length === 0) {
      addToast("Your cart is empty. Add some items before checkout.", "info");
      return;
    }
    
    if (!isAuthenticated) {
      // Redirect guests to signup page
      addToast("Please sign in to proceed with checkout", "info");
      router.push('/signup');
      setIsOpen?.(false);
    } else {
      // Authenticated users can proceed to checkout
      addToast("Proceeding to checkout...", "success");
      router.push('/checkout');
      setIsOpen?.(false);
    }
  };

  const handleViewCart = () => {
    if (displayItems.length === 0) {
      addToast("Your cart is empty. Add some items first.", "info");
      return;
    }
    
    if (!isAuthenticated) {
      // Redirect guests to signup page
      addToast("Please sign in to view your cart", "info");
      router.push('/signup');
      setIsOpen?.(false);
    } else {
      // Authenticated users can proceed to cart page
      addToast("Opening cart page...", "success");
      router.push('/cart');
      setIsOpen?.(false);
    }
  };

  // Debug function to check cart state
  const debugCartState = () => {
    console.log('=== CART DEBUG ===');
    console.log('Local items:', items);
    console.log('Display items:', displayItems);
    console.log('Unique items:', uniqueItems);
    console.log('Total items:', totalItems);
    console.log('Cart ID:', cartId);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Is guest cart:', isGuestCart);
    console.log('==================');
  };

  // Add debug button in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugCartState();
    }
  }, [items, displayItems, uniqueItems, totalItems, cartId, isAuthenticated, isGuestCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay: subtle dark, click to close */}
      <button
        aria-label="Close cart"
        onClick={() => setIsOpen && setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200"
      />

      {/* Drawer container */}
      <div className="absolute right-3 md:right-4 top-20 md:top-24">
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="bg-white rounded-lg shadow-2xl border
                     max-w-full w-[92vw] sm:w-96
                     h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)]
                     overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">MY CART</h2>
              {(isLoading || isCartLoading) && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
              )}
            </div>
            <button
              onClick={() => setIsOpen && setIsOpen(false)}
              className="p-1 rounded-full border border-[#CCCCCC] transition-colors duration-200 group cursor-pointer"
              style={{ outline: "none" }}
              aria-label="Close cart"
            >
              <X size={20} className="text-[#CCCCCC] group-hover:text-white transition-colors duration-200" />
            </button>
            <style jsx>{`
              .group:hover {
                background: #D4AF37;
                border-color: transparent;
              }
            `}</style>
          </div>

          {/* Clear-all row */}
          {displayItems.length > 0 && (
            <div className="p-3 border-b flex justify-center flex-shrink-0">
              <button
                onClick={onClearAll}
                disabled={isClearingCart}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-300 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear cart"
                title="Remove all items"
              >
                <Trash2 size={16} className="text-red-600" />
                <span>{isClearingCart ? "Clearing..." : "Clear cart"}</span>
              </button>
            </div>
          )}

          {/* Guest cart notice */}
          {isGuestCart && displayItems.length > 0 && (
            <div className="p-3 bg-blue-50 border-b border-blue-200">
              <p className="text-sm text-blue-700">
                💡 Sign up to save your cart and checkout securely
              </p>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {displayItems.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-sm text-gray-500 mb-2">
                  {isClearingCart ? "Clearing cart..." : "Your cart is empty."}
                </div>
                {!isClearingCart && (
                  <p className="text-xs text-gray-400">
                    Add some products to get started
                  </p>
                )}
              </div>
            ) : (
              uniqueItems.map((item) => {
                // Use enriched product details
                const name = item.name || 'Product Name';
                const image = item.image || '/placeholder.png';
                const hasMeta = Boolean(name) && Boolean(image);

                return (
                  <div key={item.id} className="p-3 border-b border-gray-100">
                    <div className="flex gap-2.5">
                      <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={image}
                          alt={name}
                          className={`w-full h-full object-cover ${hasMeta ? "" : "opacity-70"}`}
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-1.5 leading-tight line-clamp-2">
                          {name}
                        </p>

                        <div className="mb-2">
                          <span className="text-red-500 font-semibold">
                            {typeof item.price === "number" && Number.isFinite(item.price)
                              ? formatPrice(item.price)
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => onChangeQty(item.id, Math.max(0, item.quantity - 1))}
                            disabled={isClearingCart || pendingOperations.has(item.id)}
                            className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} className="text-gray-600" />
                          </button>

                          <span className="font-medium text-gray-900 min-w-[18px] text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => onChangeQty(item.id, item.quantity + 1)}
                            disabled={isClearingCart || pendingOperations.has(item.id)}
                            className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-bold text-black text-lg">{formatPrice(subtotal)}</span>
              </div>
              <span className="text-sm text-gray-500">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={handleViewCart}
                className="w-full py-3 rounded-lg font-medium text-black text-center border border-[#CCCCCC] bg-white hover:bg-gray-50 transition-colors"
              >
                VIEW CART
              </button>

              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-lg font-medium text-white transition-colors cursor-pointer"
                style={{ background: "#D4AF37" }}
              >
                CHECKOUT
              </button>
            </div>
          </div>
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
};

export default CartUI;
