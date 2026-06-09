export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Cart } from "@/lib/models/Cart";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, serverError, badRequest, unauthorized } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import {
    getCartPopulateOptions,
    migrateCartToLines,
    type CartLineInput,
} from "@/lib/cartLines";
import {
    addLinesToUserCart,
    isTransientMongoError,
    persistLegacyCartSync,
} from "@/lib/cartPersistence";

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
        await persistLegacyCartSync(cart);

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
        if (isTransientMongoError(error)) {
            return serverError(
                "Database temporarily unavailable. Please refresh and try again."
            );
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

        const { cart, created: isNewCart } = await addLinesToUserCart(
            decoded.sub,
            body
        );
        const populated = await Cart.findById(cart!._id).populate(
            getCartPopulateOptions()
        );

        return isNewCart ? created(populated) : ok(populated);
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
        if (isTransientMongoError(error)) {
            return serverError(
                "Database temporarily unavailable. Please wait a moment and try again."
            );
        }
        return badRequest(message);
    }
}
