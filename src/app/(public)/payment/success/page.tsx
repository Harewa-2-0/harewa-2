'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/contexts/toast-context';
import { useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '@/hooks/useOrders';
import { cartKeys, useCreateEmptyCartMutation } from '@/hooks/useCart';
import PaymentResultShell from '@/components/Public_C/payment/PaymentResultShell';
import PaymentVerifyingAnimation from '@/components/Public_C/payment/PaymentVerifyingAnimation';
import PaymentConfetti from '@/components/Public_C/payment/PaymentConfetti';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [orderReference, setOrderReference] = useState('');
  const [phase, setPhase] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const { clearCurrentOrder } = useOrderStore();
  const { clearCart } = useCartStore();
  const { addToast } = useToast();
  const createEmptyCartMutation = useCreateEmptyCartMutation();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const reference = searchParams.get('reference');

      if (!sessionId && !reference) {
        setPhase('failed');
        addToast('No payment reference found', 'error');
        return;
      }

      const paymentRef = sessionId || reference || '';
      setOrderReference(paymentRef);

      try {
        const response = await fetch(
          `/api/payment/stripe/confirm?session_id=${sessionId}`,
          { method: 'GET', credentials: 'include' }
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setPhase('success');
          clearCurrentOrder();

          try {
            await createEmptyCartMutation.mutateAsync();
          } catch (error) {
            console.error('[PaymentSuccess] Failed to create new cart:', error);
          }

          clearCart();
          await queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
          addToast('Payment verified successfully!', 'success');
        } else {
          setPhase('failed');
          addToast(data.message || 'Payment verification failed', 'error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPhase('failed');
        addToast('Failed to verify payment', 'error');
      }
    };

    verifyPayment();
  }, [
    searchParams,
    clearCurrentOrder,
    clearCart,
    queryClient,
    addToast,
    createEmptyCartMutation,
  ]);

  if (phase === 'verifying') {
    return (
      <PaymentResultShell>
        <PaymentVerifyingAnimation />
      </PaymentResultShell>
    );
  }

  if (phase === 'success') {
    return (
      <>
        <PaymentConfetti active />
        <PaymentResultShell>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Payment successful</h1>
            {orderReference && (
              <p className="mt-2 text-sm text-gray-500">
                Reference #{orderReference.slice(0, 20)}
                {orderReference.length > 20 ? '…' : ''}
              </p>
            )}
            <p className="mt-4 text-gray-600">
              Thank you for your purchase. Your order is confirmed and a receipt email is on its way.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="flex-1 cursor-pointer rounded-xl bg-[#D4AF37] px-6 py-3.5 font-semibold text-black shadow-md shadow-[#D4AF37]/25 transition-colors hover:bg-[#B8941F]"
              >
                Continue shopping
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Home page
              </button>
            </div>
          </motion.div>
        </PaymentResultShell>
      </>
    );
  }

  return (
    <PaymentResultShell>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Verification failed</h1>
        <p className="mt-3 text-gray-600">
          We couldn&apos;t verify your payment. You can try checkout again or return home.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/checkout" className="flex-1">
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl bg-[#D4AF37] px-6 py-3.5 font-semibold text-black shadow-md shadow-[#D4AF37]/25 transition-colors hover:bg-[#B8941F]"
            >
              Try again
            </button>
          </Link>
          <Link href="/home" className="flex-1">
            <button
              type="button"
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              Home page
            </button>
          </Link>
        </div>
      </motion.div>
    </PaymentResultShell>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <PaymentResultShell>
          <PaymentVerifyingAnimation />
        </PaymentResultShell>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
