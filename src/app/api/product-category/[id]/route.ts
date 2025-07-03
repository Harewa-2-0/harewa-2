import { ProductCategory } from "@/lib/models/ProductCategory";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/product-category/[id]
// Get a product category by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const categoryData = await ProductCategory.findById(params.id).lean();
    if (!categoryData) {
        return notFound("Product category not found");
    }
    return ok(categoryData);
}

// PUT /api/product-category/[id]
// Update a product category by id  
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    try {
        const updatedCategory = await ProductCategory.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updatedCategory) {
            return notFound("Product category not found");
        }
        return ok(updatedCategory);
    } catch (error) {
        return badRequest("Invalid product category data: " + error);
    }
}


// DELETE /api/product-category/[id]
// Delete a product category by id        
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    connectDB();
    try {
        const deletedCategory = await ProductCategory.findByIdAndDelete(params.id).lean();

        if (!deletedCategory) {
            return notFound("Product category not found");
        }
        return ok(deletedCategory);
    } catch (error) {
        return notFound("Product category not found: " + error);
    }
}
