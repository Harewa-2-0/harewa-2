export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Order } from "@/lib/models/Order";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";
import { getOrderCartPopulateConfig } from "@/lib/orderFulfillment";

// GET /api/order/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();

    try {
        const order = await Order.findById(id)
            .populate(getOrderCartPopulateConfig())
            .lean();

        if (!order) {
            return notFound("Order not found");
        }

        return ok({
            success: true,
            message: "Success",
            data: order,
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return badRequest("Failed to fetch orders" + error);
    }
}

// PUT /api/order/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    try {
        const updatedOrder = await Order.findByIdAndUpdate(id, body, {
            new: true,
        }).lean();
        if (!updatedOrder) {
            return notFound("Order not found");
        }
        return ok(updatedOrder);
    } catch (error) {
        return badRequest("Invalid order data: " + error);
    }
}

// DELETE /api/order/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    try {
        const deletedOrder = await Order.findByIdAndDelete(id).lean();
        if (!deletedOrder) {
            return notFound("Order not found");
        }
        return ok(deletedOrder);
    } catch (error) {
        return notFound("Order not found" + error);
    }
}
