export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Profile } from "@/lib/models/Profile";
import { Wallet } from "@/lib/models/Wallet";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { ActivityLog } from "@/lib/models/ActivityLog";
import {
    calculateCartTotal,
    getCartItemCount,
    getOrderCartPopulateConfig,
    loadCartForCheckout,
    refreshFabricLineSnapshots,
    validateCartForOrder,
} from "@/lib/orderFulfillment";

// GET /api/order
export async function GET() {
    await connectDB();

    try {
        const orders = await Order.find()
            .populate(getOrderCartPopulateConfig())
            .populate({
                path: "user",
                model: User,
                select: "username email phoneNumber",
                strictPopulate: false,
                populate: {
                    path: "profile",
                    model: Profile,
                    select: "firstName lastName profilePicture",
                },
            })
            .lean();

        return ok(orders);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return badRequest("Failed to fetch orders: " + error);
    }
}

// POST /api/order
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);

        const wallet = await Wallet.findOne({ user: user.sub });
        if (!wallet) {
            return badRequest("Wallet not found for user");
        }

        const cart = await loadCartForCheckout(body.carts);
        await refreshFabricLineSnapshots(cart);
        await validateCartForOrder(cart);

        const amount = calculateCartTotal(cart);
        if (amount <= 0) {
            return badRequest("Order total must be greater than zero");
        }

        const newOrder = new Order({
            user: user.sub,
            walletId: wallet._id,
            carts: body.carts,
            amount,
            address: body.address,
        });

        await newOrder.save();

        await ActivityLog.create({
            user: user.sub,
            action: "Placed Order",
            entityType: "Order",
            entityId: newOrder._id,
            description: `User placed order #${newOrder._id} worth $${amount}`,
            metadata: {
                totalAmount: amount,
                itemCount: getCartItemCount(cart),
            },
        });

        return created(newOrder);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
            message.includes("Cart") ||
            message.includes("stock") ||
            message.includes("available") ||
            message.includes("empty")
        ) {
            return badRequest(message);
        }
        return serverError("Failed to create order: " + message);
    }
}
