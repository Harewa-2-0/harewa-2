export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import { ProductCategory } from "@/lib/models/ProductCategory";
import { Fabric } from "@/lib/models/Fabric";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";

// GET /api/product/category/[id]
// get all product for a specific category (with pagination)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    // Extract pagination parameters
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [products, total] = await Promise.all([
        Product.find({ category: params.id })
            .select('-__v')
            .populate({
                path: "category",
                model: ProductCategory,
                select: "name description",
            })
            .populate({
                path: "fabricType",
                model: Fabric,
                select: "name type description",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ category: params.id })
    ]);

    if (!products || products.length === 0) {
        return notFound("No products found for this category");
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