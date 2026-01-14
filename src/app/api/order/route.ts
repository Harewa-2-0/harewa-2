export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Profile } from "@/lib/models/Profile";
import { Wallet } from "@/lib/models/Wallet";
import { Product } from "@/lib/models/Product";
import { Cart } from "@/lib/models/Cart";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { ActivityLog } from "@/lib/models/ActivityLog";

// GET /api/order
// Get all orders    
export async function GET() {
    await connectDB();

    try {
        const orders = await Order.find()
            .populate({
                path: "carts",
                model: Cart,
                populate: {
                    path: "products.product",
                    model: Product,
                },
            })
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
// Create a new order 
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);

        const wallet = await Wallet.findOne({ user: user.sub });
        if (!wallet) {
            return badRequest("Wallet not found for user");
        }

        // Get cart with populated products
        const cart: any = await Cart.findById(body.carts)
            .populate('products.product')
            .lean();

        if (!cart) {
            return badRequest("Cart not found");
        }

        if (!cart.products || cart.products.length === 0) {
            return badRequest("Cart is empty");
        }

        // Calculate total amount from cart products
        const amount = cart.products.reduce((sum: number, item: any) =>
            sum + ((item.product.price || 0) * (item.quantity || 0)), 0
        );

        // Create order linked to cart
        const newOrder = new Order({
            user: user.sub,
            walletId: wallet._id,
            carts: body.carts,
            amount: amount,
            address: body.address,
        });

        await newOrder.save();

        await ActivityLog.create({
            user: user.sub,
            action: "Placed Order",
            entityType: "Order",
            entityId: newOrder._id,
            description: `User placed order #${newOrder._id} worth $${amount}`,
            metadata: { totalAmount: amount, itemCount: cart.products.length },
        });

        return created(newOrder);
    } catch (error) {
        return serverError("Failed to create order: " + error);
    }
}