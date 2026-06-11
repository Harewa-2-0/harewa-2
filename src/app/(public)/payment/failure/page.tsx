'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PaymentResultShell from '@/components/Public_C/payment/PaymentResultShell';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const [orderReference, setOrderReference] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) setOrderReference(reference);
  }, [searchParams]);

  return (
    <PaymentResultShell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Payment failed</h1>

        {orderReference && (
          <p className="mt-2 text-sm text-gray-500">
            Reference #{orderReference.slice(0, 24)}
            {orderReference.length > 24 ? '…' : ''}
          </p>
        )}

        <p className="mt-4 text-gray-600">
          We couldn&apos;t process your payment. This may be due to insufficient funds,
          incorrect details, or a network issue.
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

        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:support@harewa.com" className="font-medium text-[#B8941F] hover:underline">
            support@harewa.com
          </a>
        </p>
      </motion.div>
    </PaymentResultShell>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense
      fallback={
        <PaymentResultShell>
          <div className="py-8 text-gray-500">Loading…</div>
        </PaymentResultShell>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
