"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCartTotalItems, useCartTotalItemsOptimistic, getSizeInitial, type SizeBreakdown } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/contexts/toast-context";
import { useUpdateCartQuantityMutation, useRemoveFromCartMutation, useCartRawQuery } from "@/hooks/useCart";
import { usePendingOrderQuery } from "@/hooks/useOrders";
import { formatPrice } from "@/utils/currency";
import { AlertCircle } from "lucide-react";

// Size Selector Popover Component - Rendered via Portal to escape overflow clipping
interface SizeSelectorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  sizeBreakdown: SizeBreakdown;
  availableSizes: string[];
  onSizeQuantityChange: (size: string, qty: number) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  mode: 'increase' | 'decrease';
}

const SizeSelectorPopover: React.FC<SizeSelectorPopoverProps> = ({
  isOpen,
  onClose,
  sizeBreakdown,
  availableSizes,
  onSizeQuantityChange,
  anchorRef,
  mode,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;
    
    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      const popoverHeight = popoverRef.current?.offsetHeight || 200; // Estimate if not yet rendered
      
      if (anchorRect) {
        setPosition({
          top: anchorRect.top - popoverHeight - 12, // Position above with gap
          left: anchorRect.left,
        });
      }
    };
    
    // Initial position with slight delay to allow popover to render
    updatePosition();
    const timer = setTimeout(updatePosition, 10);
    
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  // For increase mode: show ALL available sizes (including ones not in cart yet)
  // For decrease mode: show only sizes that are in cart (qty > 0)
  const sizesToShow = mode === 'increase'
    ? availableSizes.length > 0 
      ? availableSizes 
      : Object.keys(sizeBreakdown).filter(s => sizeBreakdown[s] > 0)
    : Object.keys(sizeBreakdown).filter(s => sizeBreakdown[s] > 0);

  const popoverContent = (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[220px]"
      style={{ 
        zIndex: 999999,
        top: position.top,
        left: position.left,
      }}
    >
      <div className="text-xs font-medium text-gray-500 mb-3">
        {mode === 'increase' ? 'Add to which size?' : 'Remove from which size?'}
      </div>
      <div className="space-y-3">
        {sizesToShow.map((size) => {
          const currentQty = sizeBreakdown[size] || 0;
          const isNewSize = currentQty === 0;
          
          return (
            <div key={size} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-[80px]">
                <span className={`text-sm font-semibold ${isNewSize ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getSizeInitial(size)}
                </span>
                {currentQty > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-sm">
                    {currentQty}
                  </span>
                )}
                {isNewSize && mode === 'increase' && (
                  <span className="text-[10px] text-[#B8941F] font-semibold uppercase tracking-wide">NEW</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {mode === 'decrease' && currentQty > 0 && (
                  <button
                    onClick={() => {
                      onSizeQuantityChange(size, currentQty - 1);
                      onClose();
                    }}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    aria-label={`Decrease ${size}`}
                  >
                    <Minus size={14} className="text-gray-600" />
                  </button>
                )}
                {mode === 'increase' && (
                  <button
                    onClick={() => {
                      onSizeQuantityChange(size, currentQty + 1);
                      onClose();
                    }}
                    className="w-8 h-8 bg-[#D4AF37] hover:bg-[#B8941F] rounded-full flex items-center justify-center transition-colors shadow-sm"
                    aria-label={`Add ${size}`}
                  >
                    <Plus size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Arrow pointer */}
      <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
    </motion.div>
  );

  // Render via portal to escape overflow clipping
  return typeof window !== 'undefined' 
    ? createPortal(popoverContent, document.body)
    : null;
};

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
  const quantityButtonRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  
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
  const { data: rawCart } = useCartRawQuery(isAuthenticated && isOpen);

  // Set cartId from rawCart when it loads
  useEffect(() => {
    if (rawCart && isAuthenticated) {
      const id = (rawCart as any)._id || (rawCart as any).id;
      if (id) {
        setCartId(id);
      }
    }
  }, [rawCart, isAuthenticated, setCartId]);

  // Prevent any automatic cart fetching while drawer is open
  useEffect(() => {
    if (isOpen) {
      console.log('Cart drawer opened - preventing automatic fetches');
    }
  }, [isOpen]);

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

  const totalItems = useCartTotalItemsOptimistic();

  const subtotal = useMemo(() => {
    return uniqueItems.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [uniqueItems]);

  // Clear all toasts when cart opens
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
    if (pendingOperations.has(id)) return;
    
    try {
      setPendingOperations(prev => new Set(prev).add(id));
      
      // Update local state immediately (optimistic)
      updateSizeQuantityLocal(id, size, qty);
      
      // Sync to server if authenticated
      if (isAuthenticated && cartId) {
        try {
          // Get updated item after local change
          const updatedItem = items.find(i => i.id === id);
          await updateCartMutation.mutateAsync({
            cartId,
            productId: id,
            quantity: updatedItem?.quantity || qty,
            currentItems: items,
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
          await updateCartMutation.mutateAsync({
            cartId,
            productId: id,
            quantity: qty,
            currentItems: items,
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
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                <Image
                  src="/unauthorized.png"
                  alt="Empty Cart"
                  width={128}
                  height={128}
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
              {/* Pending Order Warning Banner */}
              {hasPendingOrder && (
                <div className="mx-6 mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                  {uniqueItems.map((item) => {
                    const name = item.name || 'Product Name';
                    const image = item.image || '/placeholder.png';
                    const itemPrice = typeof item.price === 'number' ? item.price : 0;
                    const itemTotal = itemPrice * item.quantity;
                    const isPending = pendingOperations.has(item.id);
                    const sizeBreakdown = item.sizeBreakdown || {};
                    const availableSizes = (item.availableSizes as string[]) || [];
                    const activeSizes = Object.entries(sizeBreakdown).filter(([, qty]) => qty > 0);
                    const hasMultiSizes = activeSizes.length > 1;
                    // Show popover on + if there are multiple available sizes OR multiple sizes in cart
                    const showPopoverOnIncrease = availableSizes.length > 1 || hasMultiSizes;

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
                          <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                              {name}
                            </h3>

                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {formatPrice(itemPrice)}
                                </span>
                              </div>
                            </div>

                            {/* Size Breakdown Display - Toggle Style */}
                            <div className="mb-3">
                              {activeSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                  {activeSizes.map(([size, qty]) => (
                                    <div 
                                      key={size}
                                      className="inline-flex items-center h-7 rounded-full bg-gray-100 pl-2.5 pr-1 gap-1.5"
                                    >
                                      <span className="text-xs font-semibold text-gray-500">
                                        {getSizeInitial(size)}
                                      </span>
                                      <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-sm">
                                        {qty}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Size: {(() => {
                                    if (!item.size) return 'N/A';
                                    const sizeStr = String(item.size);
                                    return getSizeInitial(sizeStr);
                                  })()}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div 
                                className="relative flex items-center gap-2"
                                ref={(el) => { quantityButtonRefs.current.set(item.id, el); }}
                              >
                                <button
                                  onClick={() => handleQuantityChange(item.id, 'decrease', hasMultiSizes)}
                                  disabled={isPending}
                                  className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                    hasMultiSizes ? 'border-[#D4AF37] border-dashed' : ''
                                  }`}
                                  aria-label="Decrease quantity"
                                  title={hasMultiSizes ? 'Select size to decrease' : 'Decrease quantity'}
                                >
                                  <Minus size={14} className="text-gray-600" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 'increase', showPopoverOnIncrease)}
                                  disabled={isPending}
                                  className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                    showPopoverOnIncrease ? 'border-[#D4AF37] border-dashed' : ''
                                  }`}
                                  aria-label="Increase quantity"
                                  title={showPopoverOnIncrease ? 'Select size to add' : 'Increase quantity'}
                                >
                                  <Plus size={14} className="text-gray-600" />
                                </button>
                                
                                {/* Size Selector Popover */}
                                <AnimatePresence>
                                  {sizePopover?.itemId === item.id && (
                                    <SizeSelectorPopover
                                      isOpen={true}
                                      onClose={() => setSizePopover(null)}
                                      sizeBreakdown={sizeBreakdown}
                                      availableSizes={availableSizes}
                                      onSizeQuantityChange={(size, qty) => onChangeSizeQty(item.id, size, qty)}
                                      anchorRef={{ current: quantityButtonRefs.current.get(item.id) || null }}
                                      mode={sizePopover.mode}
                                    />
                                  )}
                                </AnimatePresence>
                              </div>

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

                {/* Fake savings calculation - commented out
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
                */}

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