export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { ok, notFound, badRequest } from "@/lib/response";
import {
    addFabricLineToCart,
    getCartPopulateOptions,
    migrateCartToLines,
    removeFabricLine,
} from "@/lib/cartLines";

// POST /api/cart/[id]/fabric/[fabricId] — add fabric bundles
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fabricId: string }> }
) {
    const { id, fabricId } = await params;
    await connectDB();
    try {
        const body = await request.json().catch(() => ({}));
        const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));

        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        migrateCartToLines(cart);
        await addFabricLineToCart(cart, {
            lineType: "fabric",
            fabric: fabricId,
            quantity,
        });
        await cart.save();

        const populated = await Cart.findById(id).populate(getCartPopulateOptions());
        return ok(populated);
    } catch (error) {
        console.error("Add fabric to cart error:", error);
        const message = error instanceof Error ? error.message : String(error);
        return badRequest(message);
    }
}

// DELETE /api/cart/[id]/fabric/[fabricId]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fabricId: string }> }
) {
    const { id, fabricId } = await params;
    await connectDB();
    try {
        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        removeFabricLine(cart, fabricId);
        await cart.save();

        const populated = await Cart.findById(id).populate(getCartPopulateOptions());
        return ok(populated);
    } catch (error) {
        console.error("Remove fabric from cart error:", error);
        return badRequest("Error removing fabric: " + error);
    }
}

// PATCH /api/cart/[id]/fabric/[fabricId] — set bundle quantity
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fabricId: string }> }
) {
    const { id, fabricId } = await params;
    await connectDB();
    try {
        const body = await request.json().catch(() => ({}));
        const quantity = Math.floor(Number(body?.quantity));
        if (!Number.isInteger(quantity) || quantity < 1) {
            return badRequest("quantity must be a positive integer");
        }

        const cart = await Cart.findById(id);
        if (!cart) {
            return notFound("Cart not found");
        }

        migrateCartToLines(cart);
        removeFabricLine(cart, fabricId);
        await addFabricLineToCart(cart, {
            lineType: "fabric",
            fabric: fabricId,
            quantity,
        });
        await cart.save();

        const populated = await Cart.findById(id).populate(getCartPopulateOptions());
        return ok(populated);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return badRequest(message);
    }
}
