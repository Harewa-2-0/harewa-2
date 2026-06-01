import { ok, badRequest, serverError, notFound } from "@/lib/response";
import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { addFunds, deductFunds } from "@/lib/wallet";
import { getUserFromUuid } from "@/lib/utils";
import { getCheckoutSession } from "@/lib/stripe";
import { completeOrderFulfillment } from "@/lib/orderFulfillment";
import connectDB from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return badRequest("Missing session_id");
    }

    try {
        await connectDB();
        const session = await getCheckoutSession(sessionId);
        const metadata = (session.metadata || {}) as Record<string, string | undefined>;
        const payment = {
            status:
                session.payment_status === "paid"
                    ? "success"
                    : session.payment_status || "unknown",
            metadata,
            amount: (session.amount_total || 0) / 100,
            id: session.id,
        };

        if (payment.status !== "success") {
            return badRequest("Payment not successful");
        }

        const { type, uuid, orderId, reference } = payment.metadata;

        if (!uuid) {
            return badRequest("Missing user UUID in payment metadata");
        }

        const user = await getUserFromUuid(uuid);

        if (!user || !user._id) {
            return badRequest("Missing user ID from payment metadata");
        }

        const txReference = reference || payment.id;

        if (type == "wallet") {
            const wallet = await Wallet.findOne({ user: user._id });
            const isDuplicate =
                wallet &&
                wallet.transactions.some(
                    (tx: { reference?: string }) => tx.reference === txReference
                );

            if (isDuplicate) {
                return serverError("Transaction already processed");
            }
            const funds = await addFunds({
                amount: payment.amount,
                userId: user._id,
                reference: txReference,
            });
            return ok(funds, "Funds processed successfully");
        }

        if (type == "order") {
            if (!orderId) {
                return badRequest("Missing orderId in payment metadata");
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return notFound("Order not found");
            }

            if (order.status === "paid") {
                return ok(order, "Order already processed");
            }

            await addFunds({
                amount: payment.amount,
                userId: user._id,
                reference: txReference,
            });

            await deductFunds({
                amount: order.amount,
                userId: user._id,
                reference: txReference,
            });

            order.status = "paid";
            await order.save();

            await completeOrderFulfillment(orderId, user._id);

            return ok(order, "Order processed successfully");
        }

        return ok(session);
    } catch (err: unknown) {
        console.error("Failed to retrieve session:", err);
        return serverError(err ? String(err) : "Failed to retrieve session");
    }
}
