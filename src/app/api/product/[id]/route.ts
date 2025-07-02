import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, badRequest, notFound } from "@/lib/response";

// GET /api/product/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const product = await Product.findById(params.id).lean();
    if (!product) {
        return notFound("Product not found");
    }
    return ok(product);
}

// PUT /api/product/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    try {
        const updated = await Product.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updated) {
            return notFound("Product not found");
        }
        return ok(updated);
    } catch (error) {
        return badRequest("Invalid product data: " + error);
    }
}

// DELETE /api/product/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const deleted = await Product.findByIdAndDelete(params.id).lean();
        if (!deleted) {
            return notFound("Product not found");
        }
        return ok(deleted);
    } catch {
        return notFound("Product not found");
    }
}
