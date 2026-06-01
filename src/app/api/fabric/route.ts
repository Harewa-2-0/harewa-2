export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Fabric } from "@/lib/models/Fabric";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest } from "@/lib/response";
import { pickFabricBody, validateFabricPayload } from "@/lib/fabricApi";

// GET /api/fabric
export async function GET(request: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sellableOnly = searchParams.get("sellable") === "true";

    const filter = sellableOnly
        ? { isSellable: true, inStock: { $ne: false } }
        : {};

    const fabrics = await Fabric.find(filter).sort({ createdAt: -1 }).lean();
    return ok(fabrics);
}

// POST /api/fabric
export async function POST(request: NextRequest) {
    await connectDB();
    const body = await request.json();
    const payload = pickFabricBody(body);

    if (!payload.name || typeof payload.name !== "string" || !payload.name.trim()) {
        return badRequest("Name is required");
    }

    const validationError = validateFabricPayload(payload, { requireName: true });
    if (validationError) {
        return badRequest(validationError);
    }

    const newFabric = new Fabric(payload);
    await newFabric.save();
    return created(newFabric);
}
