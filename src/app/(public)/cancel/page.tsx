'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CancelPage() {
    const router = useRouter();

    useEffect(() => {
        // Optional: Clear any pending payment state
        console.log('[Cancel] Payment cancelled by user');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 mt-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    {/* Icon/Image */}
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                        <Image
                            src="/unauthorized.png"
                            alt="Payment Cancelled"
                            width={128}
                            height={128}
                            className="opacity-80"
                            priority
                        />
                    </div>

                    {/* Cancelled Icon */}
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-yellow-100 p-3">
                            <XCircle className="w-12 h-12 text-yellow-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Payment Cancelled
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-2">
                        Your payment process was cancelled. No charges have been made to your account.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Your order is still pending. You can complete the payment anytime from your orders page.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full bg-[#D4AF37] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#B8941F] transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            View My Orders
                        </button>

                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Checkout
                        </button>

                        <button
                            onClick={() => router.push('/shop')}
                            className="w-full text-gray-600 font-medium py-2 hover:text-gray-900 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@harewa.com" className="text-[#D4AF37] hover:underline">
                                admin@harewa.com
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
