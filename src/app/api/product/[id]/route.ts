export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, badRequest, notFound } from "@/lib/response";
import { Wishlist } from "@/lib/models/Wishlist";
import { requireAuth } from "@/lib/middleware/requireAuth";
// File: app/api/product/[id]/route.ts

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();

    let userId: string | null = null;
    let wishlistProductIds: string[] = [];

    try {
        const decoded = requireAuth(request);
        userId = decoded.sub;

        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            wishlistProductIds = wishlist.products.map((id: string) => id.toString());
        }
    } catch (err) {
        // User not authenticated — skip wishlist logic
        console.warn("User not authenticated, skipping wishlist logic", err);
    }

    const product = await Product.findById(id).populate('category fabricType').lean();
    if (!product) {
        return notFound("Product not found");
    }

    const enriched = {
        ...product,
        favourite: product && !Array.isArray(product) && wishlistProductIds.includes((product._id as string | { toString(): string }).toString()),
    };

    return ok(enriched);
}

// PUT /api/product/[id]
// PUT /api/product/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    try {
        const updated = await Product.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!updated) {
            return notFound("Product not found");
        }
        return ok(updated);
    } catch (error) {
        return badRequest("Invalid product data: " + error);
    }
}

// DELETE /api/product/[id]
// DELETE /api/product/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    try {
        const deleted = await Product.findByIdAndDelete(id).lean();
        if (!deleted) {
            return notFound("Product not found");
        }
        return ok(deleted);
    } catch {
        return notFound("Product not found");
    }
}
