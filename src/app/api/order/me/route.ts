import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { Cart } from "@/lib/models/Cart";
import { User } from "@/lib/models/User";
import { Profile } from "@/lib/models/Profile";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";

// GET /api/order
// Get all orders    
export async function GET(request: NextRequest) {
    await connectDB();

    try {
        const user = requireAuth(request);
        const orders = await Order.find({ user: user.sub })
            .populate({
                path: "carts",
                model: Cart,
                populate: {
                    path: "products.product",
                    model: Product
                }
            }).populate({
                path: "user",
                model: User,
                select: "username email phoneNumber",
                strictPopulate: false,
                populate: {
                    path: "profile",
                    model: Profile,
                    select: "firstName lastName profilePicture",
                }
            })
            .lean();

        return ok(orders);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return badRequest("Failed to fetch orders" + error
        );
    }
}
