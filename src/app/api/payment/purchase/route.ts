import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { Order, } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { Product } from "@/lib/models/Product";
import { Cart } from "@/lib/models/Cart";
import { initializePayment2 } from "@/lib/paystack";
import { deductFunds } from "@/lib/wallet";
import { getUserFromUserid } from "@/lib/utils";

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
        //pay with wallet
        if (body.type == "wallet") {
            const wallet = await Wallet.findOne({ user: user.sub });
            if (!wallet) {
                return badRequest("Wallet not found for user");
            }
            const order = await Order.findOne({ _id: body.orderId, user: user.sub });
            if (order.status !== "pending" || order.status !== "initiated") {
                return badRequest("Order already processed");
            }
            if (!order) {
                return badRequest("Order not found");
            }
            if (order) {
                order.status = "initiated";
                await order.save();
            }
            if (order.amount > wallet.balance) {
                return badRequest("Insufficient funds in wallet");
            }


            // Deduct funds from wallet
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
            return ok({ success: true, message: "Funds deducted from wallet" });
        }
        //pay with paystack gateway
        if (body.type == "gateway") {

            const order = await Order.findOne({ _id: body.orderId, user: user.sub })
                .populate({
                    path: "carts",
                    model: Cart,
                    populate: {
                        path: "products.product",
                        model: Product
                    }
                });

            if (order.status !== "pending" && order.status !== "initiated") {
                return badRequest("Order already processed");
            }
            if (!order) {
                return badRequest("Order not found");
            }
            if (order) {
                order.status = "initiated";
                await order.save();
            }
            console.log("Order to be paid:", order);
            const paymentInit = await initializePayment2(
                user.email,
                order.amount,
                { items: order.carts.products, type: "order", amount: order.amount, uuid, orderId: order._id },
            );
            // console.log("Payment initialized:", paymentInit);
            return ok({
                success: true,
                message: "Payment initialized",
                data: paymentInit,
            });
        }
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        return serverError("Failed to initialize payment: " + error);
    }
}