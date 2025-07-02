import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";

// GET /api/product/seller/[id]
// Get all products for a specific seller
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const products = await Product.find({ seller: params.id }).lean();
    if (!products || products.length === 0) {
        return notFound("No products found for this seller");
    }
    return ok(products);
}

// PUT /api/product/seller/[id]
// Update all products for a specific seller
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    const result = await Product.updateMany({ seller: params.id }, body, { new: true });
    if (result.matchedCount === 0) {
        return notFound("No products found for this seller");
    }
    // Optionally, return updated products
    const updatedProducts = await Product.find({ seller: params.id }).lean();
    return ok(updatedProducts);
}

// Delete all products for a specific seller
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {

    await connectDB();
    const result = await Product.deleteMany({ seller: params.id });
    if (result.deletedCount === 0) {
        return notFound("No products found for this seller");
    }
    return ok({ deletedCount: result.deletedCount });
}