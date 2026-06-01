export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { ok, notFound, badRequest } from "@/lib/response";
import {
    addProductLineToCart,
    getCartPopulateOptions,
    migrateCartToLines,
    removeProductLine,
} from "@/lib/cartLines";

// POST /api/cart/[id]/product/[productId]
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; productId: string }> }
) {
    const { id, productId } = await params;
    await connectDB();
    try {
        const body = await request.json().catch(() => ({}));
        const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));

        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        migrateCartToLines(cart);
        await addProductLineToCart(cart, {
            lineType: "product",
            product: productId,
            quantity,
            productNote: body?.productNote,
        });
        await cart.save();

        const populated = await Cart.findById(id).populate(getCartPopulateOptions());
        return ok(populated);
    } catch (error) {
        console.error("Add product error:", error);
        return badRequest("Error adding product: " + error);
    }
}

// DELETE /api/cart/[id]/product/[productId]
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

        removeProductLine(cart, productId);
        await cart.save();

        const populated = await Cart.findById(id).populate(getCartPopulateOptions());
        return ok(populated);
    } catch (error) {
        console.error("Delete product error:", error);
        return badRequest("Error removing product: " + error);
    }
}
