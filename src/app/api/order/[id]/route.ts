import { Order } from "@/lib/models/Order";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/order/[id]
// Get order by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const orderData = await Order.findById(params.id).lean();
    if (!orderData) {
        return notFound("Order not found");
    }
    return ok(orderData);
}
// PUT /api/order/[id]
// Update an order by id  
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    try {
        const updatedOrder = await Order.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updatedOrder) {
            return notFound("Order not found");
        }
        return ok(updatedOrder);
    } catch (error) {
        return badRequest("Invalid order data: " + error);
    }
}
// DELETE /api/order/[id]
// Delete an order by id          
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const deletedOrder = await Order.findByIdAndDelete(params.id).lean();
        if (!deletedOrder) {
            return notFound("Order not found");
        }
        return ok(deletedOrder);
    } catch (error) {
        return notFound("Order not found" + error);
    }
}
