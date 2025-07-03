import { Order } from "@/lib/models/Order";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest } from "@/lib/response";

// GET /api/order
// Get all orders    
export async function GET() {
    await connectDB();
    const orders = await Order.find().lean();
    return ok(orders);
}
// POST /api/order
// Create a new order 
export async function POST(request: NextRequest) {
    await connectDB();
    const body = await request.json();
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return badRequest("Order items are required");
    }
    const newOrder = new Order({
        items: body.items,
        customer: body.customer || "",
        status: body.status || "pending",
        total: body.total || 0
    });
    await newOrder.save();
    return created(newOrder);
}