export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";

// GET /api/product/shop/[id]
// Get all products where shop matches id
// GET /api/product/shop/[id]
// Get all products where shop matches id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const products = await Product.find({ shop: id }).lean();
    if (!products || products.length === 0) {
        return notFound("No products found for this shop");
    }
    return ok(products);
}

// PUT /api/product/shop/[id]
// Update all products where shop matches id
// PUT /api/product/shop/[id]
// Update all products where shop matches id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const result = await Product.updateMany({ shop: id }, body, { lean: true });
    if (result.matchedCount === 0) {
        return notFound("No products found for this shop");
    }
    // Optionally, return updated products
    const updatedProducts = await Product.find({ shop: id }).lean();
    return ok(updatedProducts);
}

// DELETE /api/product/shop/[id]
// Delete all products where shop matches id
// DELETE /api/product/shop/[id]
// Delete all products where shop matches id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const result = await Product.deleteMany({ shop: id });
    if (result.deletedCount === 0) {
        return notFound("No products found for this shop");
    }
    return ok({ deletedCount: result.deletedCount });


}