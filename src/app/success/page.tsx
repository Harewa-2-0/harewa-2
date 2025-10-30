"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PaystackSuccess = () => {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying payment...");
  const [success, setSuccess] = useState<boolean | null>(null);
  const [session, setSession] = useState<unknown>(null);

  const reference = searchParams.get("reference");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");

    if (sessionId) {
      fetch(`/api/stripe/confirm?session_id=${sessionId}`)
        .then((res) => res.json())
        .then(setSession)
        .catch(console.error);
    }

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

  if (!session) return <p>Verifying payment...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Paystack Payment</h1>
        <p className={`mb-6 ${success ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
        <p>
          Session ID:{" "}
          {session
            ? typeof session === "string"
              ? session
              : JSON.stringify(session)
            : "None"}
        </p>

        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PaystackSuccess;
