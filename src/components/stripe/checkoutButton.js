"use client";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutButton({ amount, email }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const { data } = await axios.post("/api/payment/stripe/create-session", { amount, email });
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.id });
    setLoading(false);
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Processing..." : "Pay with Stripe"}
    </button>
  );
}
