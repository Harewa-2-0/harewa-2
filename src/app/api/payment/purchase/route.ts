import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { Order, } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";

import { initializePayment2 } from "@/lib/paystack";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);

        if (body.type == "gateway") {

        }
        const wallet = await Wallet.findOne({ user: user.sub });
        if (!wallet) {
            return badRequest("Wallet not found for user");
        }


        if (body.type == "gateway") {

        }
        const order = await Order.findOne({ _id: body.orderId, user: user.sub });
        if (order) {
            order.status = "initiated";
            await order.save();
        }
        if (!order) {
            return badRequest("Order not found");
        }


        const paymentInit = initializePayment2(
            user.email,
            order.amount,
            { order, type: "wallet" },
        );

        return ok({
            success: true,
            message: "Payment initialized",
            data: paymentInit,
        });
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        return serverError("Failed to initialize payment: " + error);
    }
}