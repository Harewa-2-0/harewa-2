// app/api/fashion-chat/route.ts
import { FashionChat } from "@/lib/models/FashionChat";
import dbConnect from "@/lib/db";
import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/response";
import { generateFashionRecommendations } from "@/lib/openai";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { getClientIp } from "@/lib/utils";


// POST — Create chat
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        let userId: string | null = null;
        let ip: string | null = null;

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;
        } catch {
            ip = getClientIp(req);
        }

        const {
            bodyType,
            occasion,
            preferences,
            colorPreferences,
            season,
            requirements,
        } = body;

        if (!bodyType || !occasion) {
            return badRequest("Body type and occasion are required");
        }

        // Call AI utility
        const recommendations = await generateFashionRecommendations({
            bodyType,
            occasion,
            preferences,
            colorPreferences,
            season,
            requirements,
        });

        const chat = new FashionChat({
            user: userId || null,
            ip: ip || null,
            messages: [
                { role: "user", content: JSON.stringify(body) },
                { role: "assistant", content: recommendations },
            ],
            context: {
                bodyType,
                occasion,
                preferences,
                colorPreferences,
                season,
                requirements,
            },
            recommendations,
        });

        await chat.save();

        return ok({ message: "Style recommendations generated", chat });
    } catch (err) {
        return serverError("Failed to process chat: " + err);
    }
}

// GET — Fetch chats
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        let userId: string | null = null;
        let ip: string | null = null;

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;
        } catch {
            ip = getClientIp(req);
        }

        let chats;
        if (userId) {
            chats = await FashionChat.find({ user: userId }).sort({ createdAt: -1 });
        } else {
            chats = await FashionChat.find({ ip }).sort({ createdAt: -1 });
        }

        return ok({ chats });
    } catch (err) {
        return serverError("Failed to fetch chats: " + err);
    }
}
