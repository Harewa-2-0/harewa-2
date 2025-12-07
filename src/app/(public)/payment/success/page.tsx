'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/contexts/toast-context';
import { useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '@/hooks/useOrders';
import { cartKeys, useCreateEmptyCartMutation } from '@/hooks/useCart';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [orderReference, setOrderReference] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const { clearCurrentOrder } = useOrderStore();
  const { clearCart } = useCartStore();
  const { addToast } = useToast();
  const createEmptyCartMutation = useCreateEmptyCartMutation();

  useEffect(() => {
    const verifyPayment = async () => {
      // Get session_id from URL params (Stripe sends this)
      const sessionId = searchParams.get('session_id');
      const reference = searchParams.get('reference');
      
      if (!sessionId && !reference) {
        setVerificationStatus('failed');
        setIsVerifying(false);
        addToast('No payment reference found', 'error');
        setTimeout(() => router.push('/checkout'), 3000);
        return;
      }

      const paymentRef = sessionId || reference || '';
      setOrderReference(paymentRef);

      try {
        // Call backend to verify Stripe payment
        console.log('Verifying Stripe payment with session_id:', sessionId);
        const response = await fetch(`/api/payment/stripe/confirm?session_id=${sessionId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok && data.success) {
          setVerificationStatus('success');
          
          // Clear current order from frontend state
          clearCurrentOrder();
          
          // Create a new empty cart (old cart preserved for order)
          console.log('[PaymentSuccess] Creating new empty cart for future purchases...');
          try {
            const newCart = await createEmptyCartMutation.mutateAsync();
            console.log('[PaymentSuccess] New cart created:', newCart?._id || newCart?.id);
          } catch (error) {
            console.error('[PaymentSuccess] Failed to create new cart:', error);
            // Continue anyway - not critical, user can still add items later
          }
          
          // Clear Zustand state to reset UI
          clearCart();
          
          // Refresh orders using React Query
          await queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
          
          addToast('Payment verified successfully!', 'success');
        } else {
          setVerificationStatus('failed');
          addToast(data.message || 'Payment verification failed', 'error');
          
          // Redirect to failure page after 3 seconds
          setTimeout(() => router.push(`/payment/failure?reference=${paymentRef}`), 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
        addToast('Failed to verify payment', 'error');
        
        // Redirect to failure page after 3 seconds
        setTimeout(() => router.push(`/payment/failure?reference=${paymentRef}`), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCurrentOrder, clearCart, queryClient, addToast, router]);

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
          {/* Verifying State */}
          {isVerifying && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37] mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment with Stripe...
              </p>
            </>
          )}

          {/* Success State */}
          {!isVerifying && verificationStatus === 'success' && (
            <>
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
                  Transaction <span className="font-semibold">#{orderReference.substring(0, 20)}...</span> verified
                </p>
              )}

              {/* Thank You Message */}
              <p className="text-gray-700 mb-8 max-w-md mx-auto">
                Thank you for your purchase! Your order has been confirmed and will be processed shortly.
                A confirmation email with your order details has been sent to you.
              </p>

              {/* Action Button */}
              <button
                onClick={() => router.push('/shop')}
                className="w-full md:w-auto px-8 py-4 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors shadow-md hover:shadow-lg"
              >
                CONTINUE SHOPPING
              </button>

              {/* Additional Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Go to Homepage
                </button>
                <span className="hidden sm:inline text-gray-400">•</span>
                <button
                  onClick={() => router.push('/profile')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  View Profile
                </button>
              </div>
            </>
          )}

          {/* Failed State */}
          {!isVerifying && verificationStatus === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Verification Failed
              </h1>
              <p className="text-gray-700 mb-8">
                We couldn't verify your payment. Redirecting to failure page...
              </p>
            </>
          )}
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