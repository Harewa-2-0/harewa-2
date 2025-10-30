'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { useOrderStore, formatOrderDate, getOrderStatusDisplay } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/contexts/toast-context';
import type { Order } from '@/services/order';

interface PendingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onStartNew: () => void;
  pendingOrder: Order;
}

export default function PendingOrderModal({
  isOpen,
  onClose,
  onContinue,
  onStartNew,
  pendingOrder,
}: PendingOrderModalProps) {
  const { items } = useCartStore();
  const { addToast } = useToast();
  const { deletePendingOrder } = useOrderStore();
  
  // Loading states
  const [isContinuing, setIsContinuing] = useState(false);
  const [isStartingNew, setIsStartingNew] = useState(false);

  const orderDate = formatOrderDate(pendingOrder.createdAt);
  const statusInfo = getOrderStatusDisplay(pendingOrder.status);
  const cartItemCount = items.length;

  const handleContinue = async () => {
    try {
      setIsContinuing(true);
      // Just call the parent callback - let it handle navigation
      onContinue();
    } catch (error) {
      console.error('Failed to continue with pending order:', error);
      addToast("Failed to continue with pending order. Please try again.", "error");
      setIsContinuing(false);
    }
  };

  const handleStartNew = async () => {
    try {
      setIsStartingNew(true);
      
      // Check if cart is empty
      if (cartItemCount === 0) {
        addToast("Your cart is empty. Add items to cart before checkout.", "error");
        onClose();
        return;
      }

      // FIXED: Only delete pending order, don't create new one
      // The parent component (CheckoutSection) will handle creating the new order
      console.log('[Modal] Deleting pending order...');
      const deleted = await deletePendingOrder();
      
      if (!deleted) {
        addToast("Failed to cancel pending order. Please try again.", "error");
        setIsStartingNew(false);
        return;
      }

      console.log('[Modal] Pending order deleted, calling parent callback...');
      // Close modal and let parent handle order creation
      onClose();
      onStartNew();
    } catch (error) {
      console.error('Failed to start new order:', error);
      addToast("Failed to start new order. Please try again.", "error");
      setIsStartingNew(false);
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
            onClick={isContinuing || isStartingNew ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pending Order Found
                    </h2>
                    <p className="text-sm text-gray-500">
                      You have an existing order in progress
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isContinuing || isStartingNew}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Pending Order Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Order from {orderDate}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Order Total:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(pendingOrder.amount)}
                    </span>
                  </div>
                </div>

                {/* Current Cart Info */}
                {cartItemCount > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Current Cart ({cartItemCount} items)
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      You can continue with your pending order or start fresh with your current cart.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleContinue}
                    disabled={isContinuing || isStartingNew}
                    className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isContinuing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Continuing...
                      </>
                    ) : (
                      'Continue with Pending Order'
                    )}
                  </button>
                  
                  <button
                    onClick={handleStartNew}
                    disabled={cartItemCount === 0 || isContinuing || isStartingNew}
                    className="w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isStartingNew ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting Old Order...
                      </>
                    ) : cartItemCount === 0 ? (
                      'Cart is Empty'
                    ) : (
                      'Start New Order'
                    )}
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center">
                  Starting a new order will cancel your pending order and create a fresh one from your current cart.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}