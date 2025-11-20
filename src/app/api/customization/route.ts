export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Customization } from "@/lib/models/Customization";
import { badRequest, created, ok } from "@/lib/response";
import { User } from "@/lib/models/User";
import { requireAuth } from "@/lib/middleware/requireAuth";

/**
 * POST — Create a customization request
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const users = requireAuth(req);
        const body = await req.json();

        const customization = await Customization.create({ user: users.sub, ...body });

        return created(customization);
    } catch (error) {

        return badRequest("Failed to create customization: " + error);
    }
}

/**
 * GET — Fetch all customizations
 */
export async function GET() {
    try {
        await connectDB();
        const data = await Customization.find().populate({
            path: "user",
            model: User,
        });
        return ok(data);
    } catch (error) {
        return badRequest("Failed to fetch customizations: " + error);
    }
}

