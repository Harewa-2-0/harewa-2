export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Cart } from "@/lib/models/Cart";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/cart/[id]
// Get cart by id
// GET /api/cart/[id]
// Get cart by id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const cartData = await Cart.findById(id).lean();
    if (!cartData) {
        return notFound("Cart not found");
    }
    return ok(cartData);
}

// PUT /api/cart/[id]
// Update a cart by id  

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    try {

        const cart = await Cart.findById(id);

        if (cart) {
            cart.products = [...body];

            console.log(cart.products);
            await cart.save();
            return ok(cart);
        }

        if (!cart) {
            return notFound("Cart not found");
        }

        return ok(cart);
    } catch (error) {
        console.error("Update error:", error);
        return badRequest("Invalid cart data: " + error);
    }
}

// DELETE /api/cart/[id]
// Delete a cart by id
// DELETE /api/cart/[id]
// Delete a cart by id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    try {
        const deletedCart = await Cart.findByIdAndDelete(id).lean();
        if (!deletedCart) {
            return notFound("Cart not found");
        }
        return ok(deletedCart);
    } catch (error) {
        return badRequest("Error deleting cart: " + error);
    }
}
