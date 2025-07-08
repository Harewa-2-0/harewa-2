import { Shop } from "@/lib/models/Shop";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/shop/[id]
// Get all shops by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const shopData = await Shop.findById(params.id).lean();
    if (!shopData) {
        return notFound("Shop not found");
    }
    return ok(shopData);
}
// PUT /api/shop/[id]
// Update a shop by id  
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    try {
        const updatedShop = await Shop.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updatedShop) {
            return notFound("Shop not found");
        }
        return ok(updatedShop);
    } catch (error) {
        return badRequest("Invalid shop data: " + error);
    }
}
// DELETE /api/shop/[id]
// Delete a shop by id          
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const deletedShop = await Shop.findByIdAndDelete(params.id).lean();
        if (!deletedShop) {
            return notFound("Shop not found");
        }
        return ok(deletedShop);
    } catch (error) {
        return notFound("Shop not found" + error);
    }
}
