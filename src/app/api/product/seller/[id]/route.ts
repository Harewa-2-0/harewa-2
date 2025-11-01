export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";

// GET /api/product/seller/[id]
// Get all products for a specific seller (with pagination)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    // Extract pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [products, total] = await Promise.all([
        Product.find({ seller: params.id })
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ seller: params.id })
    ]);

    if (!products || products.length === 0) {
        return notFound("No products found for this seller");
    }

    const response = {
        items: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + products.length < total,
        }
    };

    return ok(response);
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