export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import axios from "axios";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError, notFound } from "@/lib/response";
import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { addFunds, deductFunds } from "@/lib/wallet";
import { getUserFromUuid } from "@/lib/utils";
import { Iuser } from "@/lib/types/auth";
import { completeOrderFulfillment } from "@/lib/orderFulfillment";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
        return badRequest("Missing reference");
    }

    try {
        await connectDB();

        const { data } = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const payment = data?.data;
        if (!payment || payment.status !== "success") {
            return badRequest("Payment not successful");
        }

        const { type, amount, uuid, orderId } = payment.metadata;

        const user: Iuser = await getUserFromUuid(uuid);

        if (!user._id) {
            return badRequest("Missing user from payment metadata");
        }

        if (type == "wallet") {
            const wallet = await Wallet.findOne({ user: user._id });
            const isDuplicate = wallet?.transactions.some(
                (tx: { reference?: string }) => tx.reference === reference
            );

            if (isDuplicate) {
                return serverError("Transaction already processed");
            }
            const funds = await addFunds({
                amount,
                userId: user._id,
                reference,
            });
            return ok(funds, "Funds processed successfully");
        }

        if (type == "order") {
            const order = await Order.findById(orderId);
            if (!order) {
                return notFound("Order not found");
            }

            if (order.status === "paid") {
                return ok(order, "Order already processed");
            }

            await addFunds({ amount, userId: user._id, reference });
            await deductFunds({
                amount: order.amount,
                userId: user._id,
                reference,
            });

            order.status = "paid";
            await order.save();

            await completeOrderFulfillment(String(order._id), user._id);

            return ok(order, "Order processed successfully");
        }

        return badRequest("Unknown payment type");
    } catch (err: unknown) {
        console.error("Verification failed:", err);
        return serverError();
    }
}
