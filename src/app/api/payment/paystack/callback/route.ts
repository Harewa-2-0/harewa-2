import axios from "axios";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError, notFound } from "@/lib/response";
import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { addFunds, deductFunds } from "@/lib/wallet";
import { getUserFromUuid } from "@/lib/utils";
import { Iuser } from "@/lib/types/auth";


export async function GET(req: Request) {
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

        const { type, amount, uuid } = payment.metadata;

        const user: Iuser = await getUserFromUuid(uuid);

        if (!user._id) {
            badRequest("Missing order ID from payment metadata");
        }

        if (type == "wallet") {
            console.log("Adding funds to wallet for user:", user);
            const wallet = await Wallet.findOne({ user: user._id });

            // 1. Check if the reference is already recorded
            const isDuplicate = wallet.transactions.some((tx: { reference?: string }) => tx.reference === reference);

            if (isDuplicate) {
                return serverError('Transaction already processed');
            }
            const funds = await addFunds({ amount, userId: user._id, reference });
            return ok(funds, "Funds  processed successfully");
        }

        const order = await Order.findById(user._id);
        if (!order) {
            return notFound("Order not found");
        }

        if (order.status === "paid") {
            return ok(order, "Order already processed");
        }

        // Step 2: Update Order
        // if (order) { } //to be used later the defaiult order

        await addFunds({ amount, userId: user._id, reference });
        await deductFunds({
            amount: order.amount, userId: user._id, reference
        });

        order.status = "paid";
        await order.save();


        return ok(order, "Order processed successfully");


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Verification failed:", err?.message || err);
        return serverError()
    }
}
