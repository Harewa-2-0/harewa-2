import axios from "axios"
import { transferRequest } from "./types/wallet";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const initializePayment = async (email: string, amount: number, metadata = {}) => {
  const res = await axios.post("https://api.paystack.co/transaction/initialize", {
    email,
    amount: amount * 100, // Kobo
    metadata,
    callback_url: `${process.env.NEXT_PUBLIC_URL}/success`,
  }, {

    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
  })

  return res.data.data
}
export const initializePayment2 = async (
  email: string,
  amount: number,
  metadata = {}
) => {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // convert to kobo
      callback_url: process.env.PAYMENT_CALLBACK_URL,
      metadata,
    }),
  });

  const data = await res.json(); // <--- Parse the response body

  if (!res.ok) {
    // Optionally log error details
    console.error("Paystack init error:", data);
    throw new Error(data.message || "Failed to initialize Paystack payment");
  }
  // console.log("Paystack init response:", data);
  return data.data; // return the parsed response
};

export const initiatePaystackTransfer = async (
  req: transferRequest
) => {
  const { name, account_number, bank_code, amount, reason = "Wallet withdrawal" } = req;
  // Step 1: Create transfer recipient
  const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name,
      account_number,
      bank_code,
      currency: "NGN",
    }),
  });

  const recipientData = await recipientRes.json();

  if (!recipientRes.ok || !recipientData.data?.recipient_code) {
    console.error("Paystack recipient error:", recipientData);
    throw new Error(recipientData.message || "Failed to create transfer recipient");
  }

  const recipientCode = recipientData.data.recipient_code;

  // Step 2: Initiate the transfer
  const transferRes = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amount * 100, // convert to kobo
      recipient: recipientCode,
      reason,
      reference: `wd-${Date.now()}`, // optional: unique identifier
    }),
  });

  const transferData = await transferRes.json();

  if (!transferRes.ok) {
    console.error("Paystack transfer error:", transferData);
    throw new Error(transferData.message || "Failed to initiate transfer");
  }

  return transferData.data; // return useful info: reference, status, transfer_code
};

export const getPaystackBanks = async () => {
  const res = await fetch("https://api.paystack.co/bank?currency=NGN&type=nuban", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Failed to fetch Paystack banks:", data);
    throw new Error(data.message || "Unable to fetch banks");
  }
  console.log("Paystack banks response:", data);
  return data.data;
};

export const finalizePaystackTransfer = async (transfer_code: string, otp: string) => {
  const res = await fetch("https://api.paystack.co/transfer/finalize_transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transfer_code,
      otp
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Failed to finalize transfer:", data);
    throw new Error(data.message || "Transfer finalization failed");
  }

  return data.data;
};
