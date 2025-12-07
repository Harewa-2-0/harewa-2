'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Package, Calendar, User, MapPin, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrderById, getOrderStatusInfo, type Order } from '@/services/order';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/contexts/toast-context';
import { OrderPrint } from '@/components/Protected/admin/pages/orders/print';

interface PageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
    const { orderId } = use(params);
    const router = useRouter();
    const { addToast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPrint, setShowPrint] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const orderData = await getOrderById(orderId);
                console.log('Order data:', orderData);
                setOrder(orderData);
            } catch (error) {
                console.error('Failed to fetch order:', error);
                addToast('Failed to load order details', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, addToast]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserName = (): string => {
        if (!order?.user) return 'Guest User';
        if (typeof order.user === 'string') return `User ${order.user.substring(0, 8)}`;
        return order.user.name || 'Unknown User';
    };

    const getUserEmail = (): string | null => {
        if (!order?.user || typeof order.user === 'string') return null;
        return (order.user as any).email || null;
    };

    const getProducts = () => {
        if (!order?.carts) return [];
        return order.carts.products || [];
    };

    // Calculate actual subtotal from product prices
    const calculatedSubtotal = getProducts().reduce((total, cartProduct: any) => {
        const product = typeof cartProduct.product === 'object' && cartProduct.product !== null
            ? cartProduct.product
            : null;

        if (product?.price) {
            return total + (product.price * (cartProduct?.quantity || 1));
        }
        return total;
    }, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const products = getProducts();
    const statusInfo = getOrderStatusInfo(order.status);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-gray-600 mt-1">Order #{order._id.slice(-8)}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowPrint(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors"
                >
                    <Printer className="w-5 h-5" />
                    Print Order
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Created:</span>
                                </div>
                                <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Updated:</span>
                                </div>
                                <p className="text-gray-900">{formatDate(order.updatedAt)}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {products.length > 0 ? (
                                products.map((cartProduct: any, index: number) => {
                                    const product = typeof cartProduct.product === 'object' && cartProduct.product !== null
                                        ? cartProduct.product
                                        : null;

                                    return (
                                        <div key={cartProduct._id || index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {product?.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name || 'Product'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {product?.name || `Product ${index + 1}`}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                    <span>Qty: {cartProduct.quantity}</span>
                                                    {product?.price && (
                                                        <span className="font-semibold text-gray-900">
                                                            {formatPrice(product.price * cartProduct.quantity)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Size Breakdown */}
                                                {cartProduct.productNote && Array.isArray(cartProduct.productNote) && cartProduct.productNote.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
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
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>No items found in this order</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(calculatedSubtotal || order.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping:</span>
                                <span className="text-green-600 font-semibold">Free</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-gray-900">Total:</span>
                                    <span className="text-gray-900">
                                        {formatPrice(calculatedSubtotal || order.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Customer Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">Name:</span>
                                </div>
                                <p className="text-gray-900">{getUserName()}</p>
                            </div>
                            {getUserEmail() && (
                                <div>
                                    <span className="text-gray-600 font-medium block mb-1">Email:</span>
                                    <p className="text-gray-900">{getUserEmail()}</p>
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-medium">Delivery Address:</span>
                                </div>
                                <p className="text-gray-900">{order.address}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-600 font-medium block mb-1">Order ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{order._id}</p>
                            </div>
                            <div>
                                <span className="text-gray-600 font-medium block mb-1">Status:</span>
                                <p className="text-gray-900 capitalize">{order.status}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Print Modal */}
            {showPrint && order && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPrint(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Print Order - {order._id}
                                </h2>
                                <button
                                    onClick={() => setShowPrint(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                            <OrderPrint order={order} onClose={() => setShowPrint(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
