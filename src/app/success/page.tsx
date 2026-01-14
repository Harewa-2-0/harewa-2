"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/hooks/useCart";

function PaystackSuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);
  const [message, setMessage] = useState("Verifying payment...");
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const reference = searchParams.get("reference");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");

    const verifyPayment = async () => {
      try {
        // Handle Stripe payment
        if (sessionId) {
          const res = await fetch(`/api/payment/stripe/confirm?session_id=${sessionId}`);
          const data = await res.json();
          setSession(data);

          if (res.ok && data) {
            setMessage("Payment successful! Redirecting...");
            setSuccess(true);

            // Clear local cart and invalidate queries
            clearCart();
            queryClient.invalidateQueries({ queryKey: cartKeys.all });

            // Invalidate other specific queries if needed
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('cart-updated'));
            }

            // Redirect after 2 seconds
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          } else {
            setMessage(data.message || "Payment verification failed.");
            setSuccess(false);
          }
        }
        // Handle Paystack payment
        else if (reference) {
          const res = await fetch(
            `/api/payment/paystack/callback?reference=${reference}`
          );
          const data = await res.json();

          if (res.ok && data.status === "success") {
            setMessage("Payment successful! Redirecting...");
            setSuccess(true);

            // Clear local cart and invalidate queries
            clearCart();
            queryClient.invalidateQueries({ queryKey: cartKeys.all });

            // Invalidate other specific queries if needed
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('cart-updated'));
            }

            // Redirect after 2 seconds
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          } else {
            setMessage(data.message || "Payment verification failed.");
            setSuccess(false);
          }
        } else {
          setMessage("No payment reference provided.");
          setSuccess(false);
        }
      } catch (err) {
        console.error(err);
        setMessage("An error occurred while verifying payment.");
        setSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Large Gray Logo Watermark in Lower Left Corner - Responsive */}
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 lg:w-[32rem] lg:h-[32rem] opacity-10 pointer-events-none z-0">
          <img
            src="/logoNobg.webp"
            alt="Harewa Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#D4AF37] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  // Show success or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-green-600 mb-6">{message}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-red-600 mb-6">{message}</p>
          </>
        )}




        {/* Buttons - Responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!success && (
            <Link href="/checkout" className="flex-1">
              <button className="w-full px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#C4A037] transition-colors">
                Try Again
              </button>
            </Link>
          )}
          <Link href="/" className="flex-1">
            <button className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors ${success
              ? 'bg-[#D4AF37] text-black hover:bg-[#C4A037]'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              {success ? "Continue Shopping" : "Return Home"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const PaystackSuccess = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaystackSuccessContent />
    </Suspense>
  );
};

export default PaystackSuccess;