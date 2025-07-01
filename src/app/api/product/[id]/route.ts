import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";

// GET /api/product/[id]ct);
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const product = await Product.findById(params.id).lean();
    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
}

// PUT /api/product/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    try {
        const updated = await Product.findByIdAndUpdate(params.id, body, { new: true }).lean();

        if (!updated) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Invalid product data" + error }, { status: 400 });
    }
}

// DELETE /api/product/[id]);
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const deleted = await Product.findByIdAndDelete(params.id).lean();
        if (!deleted) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(deleted);
    } catch {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
}
