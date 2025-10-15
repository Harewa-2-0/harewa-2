"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaystackSuccessContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying payment...");
  const [success, setSuccess] = useState<boolean | null>(null);

  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setMessage("No payment reference provided.");
        setSuccess(false);
        return;
      }

      try {
        const res = await fetch(
          `api/payment/paystack/callback?reference=${reference}`
        );
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setMessage("Payment successful!");
          setSuccess(true);
        } else {
          setMessage(data.message || "Payment verification failed.");
          setSuccess(false);
        }
      } catch (err) {
        console.error(err);
        setMessage("An error occurred while verifying payment.");
        setSuccess(false);
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Paystack Payment</h1>
        <p className={`mb-6 ${success ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>

        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go Home
          </button>
        </Link>
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