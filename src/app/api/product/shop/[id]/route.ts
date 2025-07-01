import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";
import { connectDB } from "@/lib/db";

// GET /api/product/[id]
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
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, lean: true });
    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
}



export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const product = await Product.findByIdAndDelete(params.id).lean();
    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
}