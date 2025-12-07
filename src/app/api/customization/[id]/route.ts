export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";
import { Customization } from "@/lib/models/Customization";

// GET a single customization request by ID
// GET a single customization request by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();

    const customization = await Customization.findById(id).lean();

    if (!customization) {
        return notFound("Customization request not found");
    }

    return ok(customization);
}

// PUT /api/customization/[id]
// Update a customization request by ID
// PUT /api/customization/[id]
// Update a customization request by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    try {
        const updated = await Customization.findByIdAndUpdate(
            id,
            body,
            { new: true }
        ).lean();

        if (!updated) {
            return notFound("Customization request not found");
        }

        return ok(updated);
    } catch (error) {
        return badRequest("Invalid customization data: " + error);
    }
}

// DELETE /api/customization/[id]
// Delete a customization request
// DELETE /api/customization/[id]
// Delete a customization request
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();

    try {
        const deleted = await Customization.findByIdAndDelete(id).lean();

        if (!deleted) {
            return notFound("Customization request not found");
        }

        return ok(deleted);
    } catch (error) {
        return badRequest("Error deleting customization: " + error);
    }
}
