"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { cartKeys } from "@/hooks/useCart";
import PaymentResultShell from "@/components/Public_C/payment/PaymentResultShell";
import PaymentVerifyingAnimation from "@/components/Public_C/payment/PaymentVerifyingAnimation";
import PaymentConfetti from "@/components/Public_C/payment/PaymentConfetti";

type PaymentPhase = "verifying" | "success" | "failed";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);
  const [phase, setPhase] = useState<PaymentPhase>("verifying");
  const [message, setMessage] = useState("");

  const reference = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (sessionId) {
          const res = await fetch(
            `/api/payment/stripe/confirm?session_id=${sessionId}`
          );
          const data = await res.json();

          if (res.ok && data.success) {
            setPhase("success");
            setMessage(
              "Thank you for your purchase. A confirmation email with your order details is on its way."
            );
            clearCart();
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
            window.dispatchEvent(new Event("cart-updated"));
            return;
          }

          setPhase("failed");
          setMessage(data.error || data.message || "We couldn't verify your payment.");
          return;
        }

        if (reference) {
          const res = await fetch(
            `/api/payment/paystack/callback?reference=${reference}`
          );
          const data = await res.json();

          if (res.ok && data.success) {
            setPhase("success");
            setMessage(
              "Thank you for your purchase. A confirmation email with your order details is on its way."
            );
            clearCart();
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
            window.dispatchEvent(new Event("cart-updated"));
            return;
          }

          setPhase("failed");
          setMessage(data.error || data.message || "We couldn't verify your payment.");
          return;
        }

        setPhase("failed");
        setMessage("No payment reference was found. Please try checkout again.");
      } catch (err) {
        console.error(err);
        setPhase("failed");
        setMessage("Something went wrong while verifying your payment.");
      }
    };

    verifyPayment();
  }, [sessionId, reference, clearCart, queryClient]);

  if (phase === "verifying") {
    return (
      <PaymentResultShell>
        <PaymentVerifyingAnimation />
      </PaymentResultShell>
    );
  }

  if (phase === "success") {
    return (
      <>
        <PaymentConfetti active />
        <PaymentResultShell>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Payment successful
            </h1>
            <p className="mt-3 text-gray-600">{message}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="flex-1">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-xl bg-[#D4AF37] px-6 py-3.5 font-semibold text-black shadow-md shadow-[#D4AF37]/25 transition-colors hover:bg-[#B8941F]"
                >
                  Continue shopping
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
      </>
    );
  }

  return (
    <PaymentResultShell>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Payment failed
        </h1>
        <p className="mt-3 text-red-600/90">{message}</p>
        <p className="mt-2 text-sm text-gray-500">
          No charge was completed, or we could not confirm it. You can try again
          from checkout.
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

export default function PaymentSuccessPage() {
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
