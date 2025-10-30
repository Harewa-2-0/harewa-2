export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { ok, notFound, badRequest } from "@/lib/response";

// DELETE /api/cart/[id]/clear
// Remove all products from the cart (clear cart)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    await connectDB();
    try {
        const cart = await Cart.findById(params.id);
        if (!cart) {
            return notFound("Cart not found");
        }

        cart.products = []; // clear all products
        await cart.save();

        return ok({ message: "Cart cleared successfully", cart });
    } catch (error) {
        console.error("Clear cart error:", error);
        return badRequest("Error clearing cart: " + error);
    }
}
