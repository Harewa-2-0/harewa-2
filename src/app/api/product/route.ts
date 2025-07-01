import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";

// Create product
export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const product = new Product({
        name: body.name
    });
    await Product.create(product);
    return NextResponse.json(product, { status: 201 });
}

// Get all products
export async function GET() {
    await connectDB();
    const products = await Product.find();
    return NextResponse.json(products);
}