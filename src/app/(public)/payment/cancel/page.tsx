'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/contexts/toast-context';

function PaymentCancelContent() {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    addToast('Payment was cancelled. Your order is still pending.', 'info');
  }, [addToast]);

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
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Cancelled
          </h1>

          {/* Explanation Message */}
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            You cancelled the payment process. Your order is still pending and waiting for payment. 
            You can return to checkout to complete your order anytime.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors shadow-md hover:shadow-lg"
            >
              RETURN TO CHECKOUT
            </button>

            {/* Additional Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Continue Shopping
              </button>
              <span className="hidden sm:inline text-gray-400">•</span>
              <button
                onClick={() => router.push('/cart')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                View My Cart
              </button>
            </div>
          </div>

          {/* Support Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@harewa.com" className="text-[#D4AF37] hover:underline font-medium">
                support@harewa.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9E5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37]"></div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}

