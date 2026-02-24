import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { AiSettings } from "@/lib/models/AiSettings";
import { ok, badRequest, serverError } from "@/lib/response";
// import { requireAdmin } from "@/lib/middleware/requireAuth"; // Assuming an admin check exists

export async function GET() {
    try {
        await dbConnect();

        let settings = await AiSettings.findOne({});
        if (!settings) {
            settings = await AiSettings.create({
                botName: "StyleForge AI",
                usePublicData: false,
            });
        }

        return ok({ settings });
    } catch (err) {
        console.error("Error fetching AI settings:", err);
        return serverError("Failed to fetch AI settings");
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        // TODO: Require admin authentication here
        // requireAdmin(req);

        const body = await req.json();
        const { botName, usePublicData } = body;

        let settings = await AiSettings.findOne({});

        if (!settings) {
            settings = await AiSettings.create({
                botName: botName || "StyleForge AI",
                usePublicData: usePublicData !== undefined ? usePublicData : false,
            });
        } else {
            if (botName) settings.botName = botName;
            if (usePublicData !== undefined) settings.usePublicData = usePublicData;
            await settings.save();
        }

        return ok({ message: "AI Settings updated successfully", settings });
    } catch (err) {
        console.error("Error updating AI settings:", err);
        return serverError("Failed to update AI settings");
    }
}
