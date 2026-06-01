export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Fabric } from "@/lib/models/Fabric";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";
import { pickFabricBody, validateFabricPayload } from "@/lib/fabricApi";

// GET /api/fabric/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    const fabricData = await Fabric.findById(id).lean();
    if (!fabricData) {
        return notFound("Fabric not found");
    }
    return ok(fabricData);
}

// PUT /api/fabric/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const payload = pickFabricBody(body);

    const existing = await Fabric.findById(id).lean();
    if (!existing) {
        return notFound("Fabric not found");
    }

    const merged = { ...existing, ...payload };
    const validationError = validateFabricPayload(merged);
    if (validationError) {
        return badRequest(validationError);
    }

    if (payload.name !== undefined && !String(payload.name).trim()) {
        return badRequest("Name cannot be empty");
    }

    try {
        const updatedFabric = await Fabric.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        }).lean();
        if (!updatedFabric) {
            return notFound("Fabric not found");
        }
        return ok(updatedFabric);
    } catch (error) {
        return badRequest("Invalid fabric data: " + error);
    }
}

// DELETE /api/fabric/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    try {
        const deletedFabric = await Fabric.findByIdAndDelete(id).lean();
        if (!deletedFabric) {
            return notFound("Fabric not found");
        }
        return ok(deletedFabric);
    } catch (error) {
        return notFound("Fabric not found" + error);
    }
}
