import { Order } from "@/lib/models/Order";
import { createCheckoutSession } from "@/lib/stripe";
import { initializePayment2 } from "@/lib/paystack";
import {
  buildPaymentLineItems,
  getOrderCartPopulateConfig,
  loadCartForCheckout,
  validateCartForOrder,
} from "@/lib/orderFulfillment";

type GatewayType = "stripe-gateway" | "paystack-gateway";

/**
 * Fast path for gateway checkout after POST /api/order.
 * Order creation already validated stock and totals — avoid reloading the full cart.
 */
export async function initiateGatewayPayment({
  userId,
  orderId,
  email,
  uuid,
  gateway,
}: {
  userId: string;
  orderId: string;
  email: string;
  uuid: string;
  gateway: GatewayType;
}) {
  const order = await Order.findOne({ _id: orderId, user: userId })
    .select("_id amount status carts user")
    .lean();

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending" && order.status !== "initiated") {
    throw new Error("Order already processed");
  }

  if (order.status === "pending") {
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, user: userId, status: "pending" },
      { $set: { status: "initiated" } },
      { new: true }
    ).select("_id amount status");

    if (!updated) {
      const current = await Order.findById(orderId).select("status").lean();
      if (current?.status !== "initiated") {
        throw new Error("Order already processed");
      }
    }
  }

  if (gateway === "stripe-gateway") {
    const session = await createCheckoutSession({
      amount: order.amount,
      email,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: {
        orderId: String(order._id),
        uuid,
        amount: order.amount,
        type: "order",
      },
    });

    return session;
  }

  const cart = await loadCartForCheckout(String(order.carts));
  const items = buildPaymentLineItems(cart);

  return initializePayment2(email, order.amount, {
    items,
    type: "order",
    amount: order.amount,
    uuid,
    orderId: String(order._id),
  });
}

/**
 * Slower path when resuming payment on an older initiated order — re-validates stock.
 */
export async function initiateGatewayPaymentWithValidation({
  userId,
  orderId,
  email,
  uuid,
  gateway,
}: {
  userId: string;
  orderId: string;
  email: string;
  uuid: string;
  gateway: GatewayType;
}) {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate(
    getOrderCartPopulateConfig()
  );

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending" && order.status !== "initiated") {
    throw new Error("Order already processed");
  }

  const cartId =
    typeof order.carts === "object" && order.carts && "_id" in order.carts
      ? String(order.carts._id)
      : String(order.carts ?? "");

  const cart = await loadCartForCheckout(cartId);
  await validateCartForOrder(cart);
  const items = buildPaymentLineItems(cart);

  if (order.status === "pending") {
    order.status = "initiated";
    await order.save();
  }

  if (gateway === "stripe-gateway") {
    return createCheckoutSession({
      amount: order.amount,
      email,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: {
        orderId: String(order._id),
        uuid,
        amount: order.amount,
        type: "order",
      },
    });
  }

  return initializePayment2(email, order.amount, {
    items,
    type: "order",
    amount: order.amount,
    uuid,
    orderId: String(order._id),
  });
}
