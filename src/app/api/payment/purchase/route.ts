export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { initializePayment2 } from "@/lib/paystack";
import { deductFunds } from "@/lib/wallet";
import { getUserFromUserid } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/stripe";
import {
    buildPaymentLineItems,
    completeOrderFulfillment,
    getOrderCartPopulateConfig,
    loadCartForCheckout,
    validateCartForOrder,
} from "@/lib/orderFulfillment";
import { sendOrderStatusEmail } from "@/lib/mailer";
import { getOrderDisplayLines } from "@/utils/orderCartLines";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);
        const userDetails = await getUserFromUserid(user.sub);
        const uuid = userDetails.uuid;

        if (!body.type || !body.orderId) {
            return badRequest("Type and orderId are required");
        }

        const orderQuery = () =>
            Order.findOne({ _id: body.orderId, user: user.sub }).populate(
                getOrderCartPopulateConfig()
            );
        const notifyStatus = async (status: string, orderId: string, orderCart?: unknown) => {
            try {
                const items = getOrderDisplayLines(orderCart as { lines?: unknown[]; products?: unknown[] }).map((line) => ({
                    name: line.name,
                    quantity: line.quantity,
                    imageUrl: line.imageUrl,
                    unitLabel: line.unitLabel,
                }));
                await sendOrderStatusEmail({
                    to: user.email,
                    customerName:
                        [userDetails.firstName, userDetails.lastName].filter(Boolean).join(" ").trim() ||
                        userDetails.username ||
                        undefined,
                    orderId,
                    status,
                    items,
                });
            } catch (error) {
                console.error("Failed to send order status email:", error);
            }
        };
        const getCartIdFromOrder = (order: { carts?: unknown }) => {
            const raw = order?.carts as { _id?: unknown } | string | undefined;
            if (raw && typeof raw === "object" && "_id" in raw) {
                return String(raw._id);
            }
            return String(raw ?? "");
        };

        // Pay with wallet
        if (body.type == "wallet") {
            const wallet = await Wallet.findOne({ user: user.sub });
            if (!wallet) {
                return badRequest("Wallet not found for user");
            }

            const order = await orderQuery();
            if (!order) {
                return badRequest("Order not found");
            }
            if (order.status !== "pending" && order.status !== "initiated") {
                return badRequest("Order already processed");
            }

            const cart = await loadCartForCheckout(getCartIdFromOrder(order));
            await validateCartForOrder(cart);

            if (order.amount > wallet.balance) {
                return badRequest("Insufficient funds in wallet");
            }

            order.status = "initiated";
            await order.save();
            await notifyStatus("initiated", String(order._id), order.carts);

            const deduct = await deductFunds({
                amount: order.amount,
                userId: user.sub,
                reference: body.orderId,
            });

            if (!deduct.balance) {
                return serverError("Failed to deduct funds from wallet");
            }

            order.status = "paid";
            await order.save();
            await notifyStatus("paid", String(order._id), order.carts);
            await completeOrderFulfillment(String(order._id), user.sub);

            return ok({ success: true, message: "Funds deducted from wallet" });
        }

        // Paystack gateway
        if (body.type == "paystack-gateway") {
            const order = await orderQuery();
            if (!order) {
                return badRequest("Order not found");
            }
            if (order.status !== "pending" && order.status !== "initiated") {
                return badRequest("Order already processed");
            }

            const cart = await loadCartForCheckout(getCartIdFromOrder(order));
            await validateCartForOrder(cart);
            const items = buildPaymentLineItems(cart);

            order.status = "initiated";
            await order.save();
            await notifyStatus("initiated", String(order._id), order.carts);

            const paymentInit = await initializePayment2(user.email, order.amount, {
                items,
                type: "order",
                amount: order.amount,
                uuid,
                orderId: String(order._id),
            });

            return ok({
                success: true,
                message: "Payment initialized",
                data: paymentInit,
            });
        }

        // Stripe gateway
        if (body.type == "stripe-gateway") {
            const order = await orderQuery();
            if (!order) {
                return badRequest("Order not found");
            }
            if (order.status !== "pending" && order.status !== "initiated") {
                return badRequest("Order already processed");
            }

            const cart = await loadCartForCheckout(getCartIdFromOrder(order));
            await validateCartForOrder(cart);
            const items = buildPaymentLineItems(cart);

            order.status = "initiated";
            await order.save();
            await notifyStatus("initiated", String(order._id), order.carts);

            const paymentInit = await createCheckoutSession({
                amount: order.amount,
                email: user.email,
                successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
                metadata: {
                    orderId: String(order._id),
                    uuid,
                    amount: order.amount,
                    type: "order",
                },
            });

            return ok({
                success: true,
                message: "Payment initialized",
                data: paymentInit,
            });
        }

        return badRequest("Invalid payment type");
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        const message = error instanceof Error ? error.message : String(error);
        return badRequest(message);
    }
}
