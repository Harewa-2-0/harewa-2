'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getOrderById, getOrderStatusInfo, type Order } from '@/services/order';
import { useOrderStore } from '@/store/orderStore';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import { useRouter } from 'next/navigation';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { setCurrentOrder } = useOrderStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !isOpen) return;

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        console.log('Order data:', orderData);
        console.log('Cart data:', orderData?.carts);
        console.log('Products:', orderData?.carts?.products);

        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        addToast('Failed to load order details. Please try again.', 'error');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isOpen, addToast, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCompletePayment = () => {
    if (order) {
      setCurrentOrder(order);
      onClose();
      router.push('/checkout');
    }
  };

  // Helper to safely get products from order
  const getOrderProducts = () => {
    if (!order) return [];

    // Check if carts exists and has products
    if (order.carts && Array.isArray(order.carts.products)) {
      return order.carts.products;
    }

    // Fallback: check if products is directly on order
    if (Array.isArray((order as any).products)) {
      return (order as any).products;
    }

    return [];
  };

  if (!isOpen || !orderId) return null;

  const products = getOrderProducts();
  console.log('Rendered products:', products);

  // Calculate actual subtotal from product prices
  const calculatedSubtotal = products.reduce((total: number, cartProduct: any) => {
    const product = typeof cartProduct.product === 'object' && cartProduct.product !== null
      ? cartProduct.product
      : null;

    if (product?.price) {
      return total + (product.price * (cartProduct?.quantity || 1));
    }
    return total;
  }, 0);

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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                    <p className="text-sm text-gray-600">
                      {order ? `Order #${order._id?.slice(-8) || 'Unknown'}` : 'Loading...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {loading ? (
                  <div className="p-8 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                      <span className="text-gray-600">Loading order details...</span>
                    </div>
                  </div>
                ) : !order ? (
                  <div className="p-8 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
                    <p className="text-gray-500">The order you're looking for doesn't exist.</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main Content */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Order Status */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusInfo(order.status || 'pending').color}`}>
                              {getOrderStatusInfo(order.status || 'pending').label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-600 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ordered:
                              </span>
                              <span className="text-gray-800">{order.createdAt ? formatDate(order.createdAt) : 'Unknown'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-600 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Updated:
                              </span>
                              <span className="text-gray-800">{order.updatedAt ? formatDate(order.updatedAt) : 'Unknown'}</span>
                            </div>
                          </div>

                          {(order.status === 'pending' || order.status === 'initiated') && (
                            <div className="mt-4 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                              <p className="text-[#B8941F] text-sm font-medium">
                                This order is pending payment. Complete your payment to confirm your order.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Items</h3>
                          <div className="space-y-4">
                            {products.length > 0 ? (
                              products.map((cartProduct: any, index: number) => {
                                // Handle both populated and unpopulated product references
                                const product = typeof cartProduct.product === 'object' && cartProduct.product !== null
                                  ? cartProduct.product
                                  : null;

                                const productId = typeof cartProduct.product === 'string'
                                  ? cartProduct.product
                                  : product?._id;

                                return (
                                  <div key={productId || index} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                      {product?.images?.[0] ? (
                                        <img
                                          src={product.images[0]}
                                          alt={product.name || 'Product'}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <Package className="w-6 h-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 truncate">
                                        {product?.name || `Product ${index + 1}`}
                                      </h4>
                                      <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-600">
                                          Qty: {cartProduct?.quantity || 1}
                                        </p>
                                        {product?.price && (
                                          <p className="text-sm font-semibold text-gray-900">
                                            {formatPrice(product.price * (cartProduct?.quantity || 1))}
                                          </p>
                                        )}
                                      </div>

                                      {/* Size Breakdown from productNote */}
                                      {cartProduct?.productNote && Array.isArray(cartProduct.productNote) && cartProduct.productNote.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {cartProduct.productNote.map((note: string, noteIndex: number) => (
                                            <span
                                              key={noteIndex}
                                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#B8941F] border border-[#D4AF37]/30"
                                            >
                                              {note}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {product?.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                          {product.description}
                                        </p>
                                      )}
                                      {!product && (
                                        <p className="text-xs text-gray-400 mt-1 italic">
                                          Product details unavailable
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="font-medium text-gray-700 mb-1">No items found in this order</p>
                                <p className="text-sm text-gray-500">
                                  The order items could not be loaded. Please try again later.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Subtotal:</span>
                              <span className="text-gray-900 font-semibold">{formatPrice(calculatedSubtotal || order.amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Shipping:</span>
                              <span className="text-green-600 font-semibold">Free</span>
                            </div>
                            <div className="border-t border-gray-300 pt-3">
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-gray-900">{formatPrice(calculatedSubtotal || order.amount || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Information</h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium block mb-1">Order ID:</span>
                              <p className="text-gray-900 font-mono text-xs break-all">{order._id}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium block mb-1">Status:</span>
                              <p className="text-gray-900 capitalize">{order.status}</p>
                            </div>
                            {order.address && (
                              <div>
                                <span className="text-gray-600 font-medium block mb-1">Delivery Address:</span>
                                <p className="text-gray-900">{order.address}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900">Actions</h3>
                          <div className="space-y-3">
                            {(order.status === 'pending' || order.status === 'initiated') && (
                              <button
                                onClick={handleCompletePayment}
                                className="w-full bg-[#D4AF37] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#B8941F] transition-colors shadow-sm"
                              >
                                Complete Payment
                              </button>
                            )}
                            <button
                              onClick={onClose}
                              className="w-full bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}