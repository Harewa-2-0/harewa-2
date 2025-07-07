import { ProductCategory } from "@/lib/models/ProductCategory";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest } from "@/lib/response";

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
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    const newCategory = new ProductCategory({
        name: body.name,
        description: body.description || ""
    });
    await newCategory.save();
    return created(newCategory);
}
