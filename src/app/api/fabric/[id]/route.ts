export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Fabric } from "@/lib/models/Fabric";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET /api/fabric/[id]
// Get fabric by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const fabricData = await Fabric.findById(params.id).lean();
    if (!fabricData) {
        return notFound("Fabric not found");
    }
    return ok(fabricData);
}
// PUT /api/fabric/[id]
// Update a fabric by id  
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    try {
        const updatedFabric = await Fabric.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updatedFabric) {
            return notFound("Fabric not found");
        }
        return ok(updatedFabric);
    } catch (error) {
        return badRequest("Invalid fabric data: " + error);
    }
}
// DELETE /api/fabric/[id]
// Delete a fabric by id          
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    try {
        const deletedFabric = await Fabric.findByIdAndDelete(params.id).lean();
        if (!deletedFabric) {
            return notFound("Fabric not found");
        }
        return ok(deletedFabric);
    } catch (error) {
        return notFound("Fabric not found" + error);
    }
}
