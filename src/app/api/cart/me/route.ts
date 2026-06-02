export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Cart } from "@/lib/models/Cart";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, serverError, badRequest, unauthorized } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import {
    applyCartLineInputs,
    getCartPopulateOptions,
    migrateCartToLines,
    syncLegacyProductsField,
    type CartLineInput,
} from "@/lib/cartLines";

// GET /api/cart/me
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const decoded = requireAuth(request);

        let cart = await Cart.findOne({ user: decoded.sub })
            .sort({ createdAt: -1 })
            .populate(getCartPopulateOptions());

        if (!cart) {
            return ok({ cart: { products: [], lines: [] } });
        }

        migrateCartToLines(cart);
        syncLegacyProductsField(cart);
        if (cart.isModified()) {
            await cart.save();
        }

        return ok({ cart });
    } catch (error) {
        console.error("Cart fetch error:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (
            message.includes("Token expired") ||
            message.includes("Invalid token") ||
            message.includes("No access token")
        ) {
            return unauthorized(message);
        }
        return serverError("Failed to fetch cart: " + error);
    }
}

// POST /api/cart/me — add product and/or fabric bundle lines
// Body: [{ product, quantity, productNote? }] | [{ lineType: "fabric", fabric, quantity }]
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = (await request.json()) as CartLineInput[];
        const decoded = requireAuth(request);

        if (!Array.isArray(body) || body.length === 0) {
            return badRequest("Request body must be a non-empty array of cart lines");
        }

        let cart = await Cart.findOne({ user: decoded.sub }).sort({ createdAt: -1 });

        if (cart) {
            await applyCartLineInputs(cart, body);
            await cart.save();
            const populated = await Cart.findById(cart._id).populate(
                getCartPopulateOptions()
            );
            return ok(populated);
        }

        const newCart = new Cart({
            user: decoded.sub,
            lines: [],
            products: [],
        });
        await applyCartLineInputs(newCart, body);
        await newCart.save();

        const populated = await Cart.findById(newCart._id).populate(
            getCartPopulateOptions()
        );
        return created(populated);
    } catch (error) {
        console.error("Cart add error:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (
            message.includes("Token expired") ||
            message.includes("Invalid token") ||
            message.includes("No access token")
        ) {
            return unauthorized(message);
        }
        return badRequest(message);
    }
}
