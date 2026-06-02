export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, unauthorized } from "@/lib/response";
import { Customization } from "@/lib/models/Customization";
import { requireAuth } from "@/lib/middleware/requireAuth";

// GET /api/customization/me
// Returns all customization requests for the authenticated user
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = requireAuth(request);
        const customizations = await Customization.find({ user: user.sub })
            .sort({ createdAt: -1 })
            .lean();

        return ok(customizations ?? []);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
            message.includes("No access token") ||
            message.includes("Invalid token") ||
            message.includes("Token expired")
        ) {
            return unauthorized(message);
        }
        return badRequest("Failed to fetch customizations: " + message);
    }
}
