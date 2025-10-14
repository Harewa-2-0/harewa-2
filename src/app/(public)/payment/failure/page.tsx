'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function PaymentFailure() {
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
          {/* Failure Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>

          {/* Failure Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Failed
          </h1>

          {/* Order Reference */}
          {orderReference && (
            <p className="text-gray-600 text-lg mb-8">
              Order <span className="font-semibold">#{orderReference}</span> could not be processed
            </p>
          )}

          {/* Explanation Message */}
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            We were unable to process your payment. This could be due to insufficient funds, 
            incorrect payment details, or a network issue. Please try again or contact support if the problem persists.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors shadow-md hover:shadow-lg"
            >
              TRY AGAIN
            </button>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                View My Orders
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