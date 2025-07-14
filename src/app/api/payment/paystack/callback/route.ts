import axios from "axios";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError, notFound } from "@/lib/response";
import { Order } from "@/lib/models/Order";


export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
        return badRequest("Missing reference");
    }

    try {
        await connectDB();

        // Step 1: Verify payment
        const { data } = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const payment = data?.data;
        console.log("Payment verification result:", payment);
        if (!payment || payment.status !== "success") {
            return badRequest("Payment not successful");
        }

        const { _id, } = payment.metadata;

        if (!_id) {
            badRequest("Missing order ID from payment metadata");
        }

        const order = await Order.findById(_id);
        if (!order) {
            return notFound("Order not found");
        }

        if (order.status === "paid") {
            return ok(order, "Order already processed");
        }


        // Step 2: Update Order

        order.status = "paid";
        await order.save();


        return ok(order, "Order processed successfully");


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Verification failed:", err?.message || err);
        return serverError()
    }
}
