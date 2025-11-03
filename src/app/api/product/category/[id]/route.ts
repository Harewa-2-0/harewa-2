export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import { ProductCategory } from "@/lib/models/ProductCategory";
import { Fabric } from "@/lib/models/Fabric";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";

// GET /api/product/category/[id]
// get all product for a specific category
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const products = await Product.find({ category: params.id })
        .populate({
            path: "category",
            model: ProductCategory,
            select: ["name", "description", "id"],
        })
        .populate({
            path: "fabricType",
            model: Fabric,
            // remove: ["_id", "createdAt", "updatedAt"]
        }).lean();
    if (!products || products.length === 0) {
        return notFound("No products found for this category");
    }
    return ok(products);
}