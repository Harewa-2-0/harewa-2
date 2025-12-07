export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { ProductCategory } from "@/lib/models/ProductCategory";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/product-category/[id]
// Get a product category by id
// GET /api/product-category/[id]
// Get a product category by id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const categoryData = await ProductCategory.findById(id).lean();
    if (!categoryData) {
        return notFound("Product category not found");
    }
    return ok(categoryData);
}

// PUT /api/product-category/[id]
// Update a product category by id  
// PUT /api/product-category/[id]
// Update a product category by id  
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    try {
        const updatedCategory = await ProductCategory.findByIdAndUpdate(id, body, { new: true }).lean();
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
// DELETE /api/product-category/[id]
// Delete a product category by id        
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    connectDB();
    try {
        const deletedCategory = await ProductCategory.findByIdAndDelete(id).lean();

        if (!deletedCategory) {
            return notFound("Product category not found");
        }
        return ok(deletedCategory);
    } catch (error) {
        return notFound("Product category not found: " + error);
    }
}
