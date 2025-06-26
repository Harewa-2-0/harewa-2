import axios from "axios"

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

export const initializePayment2 = async (email: string, amount: number, metadata = {}) => {
  const res = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // in kobo
        callback_url: `${process.env.CALLBACK_URL}/event/payment/callback`,
        metadata
      })
    });
  return res;
}
