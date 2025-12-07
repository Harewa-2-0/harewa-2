export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { ok, notFound, badRequest } from "@/lib/response";

// POST /api/cart/[id]/product/[productId]
// Add a product to a cart
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; productId: string }> }
) {
    const { id, productId } = await params;
    await connectDB();
    try {
        const body = await request.json().catch(() => ({})); // in case quantity is sent
        const quantity = body?.quantity || 1;

        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        // Check if product already exists in cart
        const existingProduct = cart.products.find(
            (item: any) => item.product.toString() === productId
        );

        if (existingProduct) {
            // Update quantity if already exists
            existingProduct.quantity += quantity;
        } else {
            // Otherwise push new product
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        return ok(cart);
    } catch (error) {
        console.error("Add product error:", error);
        return badRequest("Error adding product: " + error);
    }
}

// DELETE /api/cart/[id]/product/[productId]
// Remove a product from a cart
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; productId: string }> }
) {
    const { id, productId } = await params;
    await connectDB();
    try {
        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        cart.products = cart.products.filter(
            (item: any) => item.product.toString() !== productId
        );

        await cart.save();
        return ok(cart);
    } catch (error) {
        console.error("Delete product error:", error);
        return badRequest("Error removing product: " + error);
    }
}
