import { Order } from "@/lib/models/Order";
import { Wallet } from "@/lib/models/Wallet";
import { Product } from "@/lib/models/Product";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
//this hould gat all wallet
export async function GET() {
    await connectDB();

    try {
        const orders = await Order.find()
            .populate({
                path: "carts",
                populate: {
                    path: "products.product",
                    model: Product
                }
            })
            .lean();

        return ok({
            success: true,
            message: "Success",
            data: orders
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return badRequest("Failed to fetch orders" + error
        );
    }
}

//this shpuld create new wallet
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);
        const wallet = await Wallet.findOne({
            user: user.sub,
        });
        if (!wallet) {
            return badRequest("Wallet not found for user");
        }
        //prevent duplicate orders
        const existingOrder = await Order.findOne({
            carts: body.carts,
            user: user.sub,
        }).lean();
        if (existingOrder) {
            return badRequest("Order already exists for this cart");
        }
        const newOrder = new Order({ user: user.sub, walletId: wallet._id, ...body });
        await newOrder.save();
        return created(newOrder);
    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}