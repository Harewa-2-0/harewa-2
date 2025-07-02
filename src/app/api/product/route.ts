import { NextRequest, } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, badRequest, created, } from "@/lib/response";

// Create product
export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    const product = new Product({
        name: body.name
    });
    await Product.create(product);
    return created(product);
}

// Get all products
export async function GET() {
    await connectDB();
    const products = await Product.find();

    return ok(products);
}