export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";
import { getOrderCartPopulateConfig } from "@/lib/orderFulfillment";
import { sendOrderStatusEmail } from "@/lib/mailer";
import { getOrderDisplayLines } from "@/utils/orderCartLines";

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
        const existingOrder = await Order.findById(id).lean();
        if (!existingOrder) {
            return notFound("Order not found");
        }

        const previousStatus = existingOrder.status;
        const nextStatus = typeof body?.status === "string" ? body.status : previousStatus;

        const updatedOrder = await Order.findByIdAndUpdate(id, body, {
            new: true,
        })
            .populate(getOrderCartPopulateConfig())
            .lean();
        if (!updatedOrder) {
            return notFound("Order not found");
        }

        if (
            previousStatus !== nextStatus &&
            typeof nextStatus === "string"
        ) {
            try {
                const orderWithCart = updatedOrder;
                const user = await User.findById(updatedOrder.user).lean();
                if (user?.email) {
                    const fullName =
                        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
                        user.username ||
                        undefined;
                    const items = getOrderDisplayLines(orderWithCart?.carts).map((line) => ({
                        name: line.name,
                        quantity: line.quantity,
                        imageUrl: line.imageUrl,
                        unitLabel: line.unitLabel,
                    }));
                    await sendOrderStatusEmail({
                        to: user.email,
                        customerName: fullName,
                        orderId: String(updatedOrder._id),
                        status: nextStatus,
                        items,
                    });
                }
            } catch (emailError) {
                // Don't block status updates if email provider has issues.
                console.error("Failed to send order status email:", emailError);
            }
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
        const order = await Order.findById(id).lean();
        if (!order) {
            return notFound("Order not found");
        }
        if (order.status !== "pending" && order.status !== "initiated") {
            return badRequest("Only pending or initiated orders can be cancelled");
        }

        const deletedOrder = await Order.findByIdAndDelete(id).lean();
        if (!deletedOrder) {
            return notFound("Order not found");
        }
        return ok(deletedOrder);
    } catch (error) {
        return notFound("Order not found" + error);
    }
}
