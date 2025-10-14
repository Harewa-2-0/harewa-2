'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrderStore } from '@/store/orderStore';
import { useToast } from '@/contexts/toast-context';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCurrentOrder, fetchPendingOrder, fetchAllOrders } = useOrderStore();
  const { addToast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderReference, setOrderReference] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      // Get reference from URL params (Paystack sends 'reference' param)
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      
      if (!reference && !trxref) {
        setStatus('failed');
        addToast('No payment reference found', 'error');
        setTimeout(() => router.push('/checkout'), 3000);
        return;
      }

      const paymentRef = reference || trxref || '';
      setOrderReference(paymentRef);

      try {
        // Call your backend to verify the payment
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: paymentRef }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          
          // Clear current order from frontend state
          clearCurrentOrder();
          
          // Refresh orders to get updated status
          await fetchAllOrders();
          
          addToast('Payment successful!', 'success');
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push(`/payment/success?reference=${paymentRef}`);
          }, 2000);
        } else {
          setStatus('failed');
          addToast(data.message || 'Payment verification failed', 'error');
          
          // Redirect to failure page after 3 seconds
          setTimeout(() => router.push(`/payment/failure?reference=${paymentRef}`), 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        addToast('Failed to verify payment', 'error');
        
        // Redirect to failure page after 3 seconds
        setTimeout(() => router.push(`/payment/failure?reference=${paymentRef}`), 3000);
      }
    };

    verifyPayment();
  }, [searchParams, clearCurrentOrder, fetchAllOrders, addToast, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your order has been confirmed. Redirecting...
            </p>
            {orderReference && (
              <p className="text-sm text-gray-500">
                Reference: {orderReference}
              </p>
            )}
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. Redirecting back to checkout...
            </p>
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors"
            >
              Back to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}