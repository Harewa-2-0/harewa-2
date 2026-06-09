export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

import { NextRequest } from "next/server";
import connectDB, { withMongoRetry } from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { deductFunds } from "@/lib/wallet";
import { getUserFromUserid } from "@/lib/utils";
import {
    completeOrderFulfillment,
    getOrderCartPopulateConfig,
    loadCartForCheckout,
    validateCartForOrder,
} from "@/lib/orderFulfillment";
import { notifyOrderPaid } from "@/lib/mailer";
import { isTransientMongoError } from "@/lib/cartPersistence";
import { getOrderDisplayLines } from "@/utils/orderCartLines";
import { initiateGatewayPayment } from "@/lib/gatewayPayment";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const user = requireAuth(request);

    if (!body.type || !body.orderId) {
        return badRequest("Type and orderId are required");
    }

    try {
        return await withMongoRetry(async () => {
            await connectDB();
            const userDetails = await getUserFromUserid(user.sub);
            const uuid = userDetails.uuid;

            const getCartIdFromOrder = (order: { carts?: unknown }) => {
                const raw = order?.carts as { _id?: unknown } | string | undefined;
                if (raw && typeof raw === "object" && "_id" in raw) {
                    return String(raw._id);
                }
                return String(raw ?? "");
            };

            const notifyPaid = async (
                orderId: string,
                orderCart: unknown,
                orderAmount: number
            ) => {
                try {
                    const items = getOrderDisplayLines(
                        orderCart as { lines?: unknown[]; products?: unknown[] }
                    ).map((line) => ({
                        name: line.name,
                        quantity: line.quantity,
                        imageUrl: line.imageUrl,
                        unitLabel: line.unitLabel,
                    }));
                    const customerName =
                        [userDetails.firstName, userDetails.lastName]
                            .filter(Boolean)
                            .join(" ")
                            .trim() ||
                        userDetails.username ||
                        undefined;

                    await notifyOrderPaid({
                        customerEmail: user.email,
                        customerName,
                        orderId,
                        amount: orderAmount,
                        items,
                    });
                } catch (error) {
                    console.error("Failed to send order paid emails:", error);
                }
            };

            if (body.type == "wallet") {
                const wallet = await Wallet.findOne({ user: user.sub });
                if (!wallet) {
                    return badRequest("Wallet not found for user");
                }

                const order = await Order.findOne({
                    _id: body.orderId,
                    user: user.sub,
                }).populate(getOrderCartPopulateConfig());

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
                await notifyPaid(String(order._id), order.carts, order.amount);
                await completeOrderFulfillment(String(order._id), user.sub);

                return ok({ success: true, message: "Funds deducted from wallet" });
            }

            if (
                body.type === "paystack-gateway" ||
                body.type === "stripe-gateway"
            ) {
                const paymentInit = await initiateGatewayPayment({
                    userId: user.sub,
                    orderId: body.orderId,
                    email: user.email,
                    uuid,
                    gateway: body.type,
                });

                return ok({
                    success: true,
                    message: "Payment initialized",
                    data: paymentInit,
                });
            }

            return badRequest("Invalid payment type");
        }, 2);
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        if (isTransientMongoError(error)) {
            return serverError(
                "Database temporarily unavailable. Please wait a moment and try checkout again."
            );
        }
        const message = error instanceof Error ? error.message : String(error);
        return badRequest(message);
    }
}
