export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Customization } from "@/lib/models/Customization";
import { badRequest, created, ok } from "@/lib/response";
import { User } from "@/lib/models/User";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { sendCustomRequestMail } from "@/lib/mailer";

/**
 * POST — Create a customization request
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const users = requireAuth(req);
        const body = await req.json();
        console.log("POST /api/customization body:", JSON.stringify(body, null, 2));

        const customization = await Customization.create({ user: users.sub, ...body });
        console.log("Created customization:", customization);
        // Send notification emails
        await sendCustomRequestMail({
            to: users.email,
            subject: "Harewa - Customization Request",
            type: "user",
            data: customization,
        });
        await sendCustomRequestMail({
            to: process.env.ADMIN_EMAIL || "",
            subject: "Harewa - Customization Request",
            type: "admin",
            data: customization,
            customerEmail: users.email,
        });
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

