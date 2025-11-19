export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound } from "@/lib/response";
import { Customization } from "@/lib/models/Customization";
import { requireAuth } from "@/lib/middleware/requireAuth";

// GET /api/customization/user/[userId]
// Returns ALL customization requests belonging to a specific user
export async function GET(request: NextRequest) {
    await connectDB();
    const user = requireAuth(request);
    const customizations = await Customization.find({ user: user.sub }).lean();

    if (!customizations || customizations.length === 0) {
        return notFound("No customization requests found for this user");
    }

    return ok(customizations);
}
