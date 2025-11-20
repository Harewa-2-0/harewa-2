import { ok, badRequest, serverError, notFound } from "@/lib/response";
import { Order, } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { addFunds, deductFunds } from "@/lib/wallet";
import { getUserFromUuid } from "@/lib/utils";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return badRequest("Missing session_id");
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        // Map the Stripe session to a minimal internal payment shape expected by the rest of the handler
        const metadata = (session.metadata || {}) as Record<string, string | undefined>;
        const payment = {
            status: session.payment_status === "paid" ? "success" : (session.payment_status || "unknown"),
            metadata,
            amount: session.amount_total || 0,
            id: session.id,
        };

        console.log("Payment verification result:", payment);
        if (!payment || payment.status !== "success") {
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

        // Use metadata reference when present, otherwise fall back to session id
        const txReference = reference || payment.id;

        if (type == "wallet") {
            console.log("Adding funds to wallet for user:", user);
            const wallet = await Wallet.findOne({ user: user._id });

            // 1. Check if the reference is already recorded
            const isDuplicate = wallet && wallet.transactions.some((tx: { reference?: string }) => tx.reference === txReference);

            if (isDuplicate) {
                return serverError('Transaction already processed');
            }
            const funds = await addFunds({ amount: payment.amount, userId: user._id, reference: txReference });
            return ok(funds, "Funds  processed successfully");
        }

        if (type == "order") {
            await addFunds({ amount: payment.amount, userId: user._id, reference: txReference });

            const order = await Order.findById(orderId);
            if (!order) {
                return notFound("Order not found");
            }

            if (order.status === "paid") {
                return ok(order, "Order already processed");
            }

            await deductFunds({
                amount: order.amount, userId: user._id, reference: txReference
            });

            order.status = "paid";
            await order.save();

            return ok(order, "Order processed successfully");
        }
        return ok(session);
    } catch (err: unknown) {
        console.error("Failed to retrieve session:", err);
        return serverError(err ? String(err) : "Failed to retrieve session");
    }
}
