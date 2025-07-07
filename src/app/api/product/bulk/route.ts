import { NextRequest, } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, created, } from "@/lib/response";

// Create bulk products
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        if (!Array.isArray(body)) {
            return Response.json({ error: "Request body must be an array of products" }, { status: 400 });
        }
        const products = await Product.insertMany(body)
        return created(products);
    } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}


// Get all products
export async function GET() {
    await connectDB();
    const products = await Product.find();

    return ok(products);
}