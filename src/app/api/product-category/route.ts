import { ProductCategory } from "@/lib/models/ProductCategory";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created } from "@/lib/response";

// GET /api/product-category
// Get all product categories    
export async function GET() {
    await connectDB();
    const categories = await ProductCategory.find().lean();
    return ok(categories);
}

// POST /api/product-category
// Create a new product category 
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const existingCategory = await ProductCategory.findOne({ name: body.name });
        if (existingCategory) {
            return Response.json({ error: "Category with this name already exists." }, { status: 400 });
        }
        const newCategory = new ProductCategory(body);
        await newCategory.save();
        return created(newCategory);
    } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}
