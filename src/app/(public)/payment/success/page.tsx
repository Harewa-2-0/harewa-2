'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderReference, setOrderReference] = useState<string>('');

  useEffect(() => {
    // Get reference from URL params
    const reference = searchParams.get('reference');
    if (reference) {
      setOrderReference(reference);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#FFF9E5] flex flex-col">
      {/* Header */}
      <header className="bg-black py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Image 
            src="/logo.png" 
            alt="HAREWA" 
            width={150} 
            height={50}
            className="object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Successful
          </h1>

          {/* Order Reference */}
          {orderReference && (
            <p className="text-gray-600 text-lg mb-8">
              Order <span className="font-semibold">#{orderReference}</span> has been processed successfully
            </p>
          )}

          {/* Thank You Message */}
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            Thank you for your purchase! Your order has been confirmed and will be processed shortly.
            You can track your order status in your orders page.
          </p>

          {/* Action Button */}
          <button
            onClick={() => router.push('/orders')}
            className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors shadow-md hover:shadow-lg"
          >
            RETURN TO MY ORDERS
          </button>

          {/* Additional Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Continue Shopping
            </button>
            <span className="hidden sm:inline text-gray-400">•</span>
            <button
              onClick={() => router.push('/orders')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              View Order Details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9E5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37]"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}