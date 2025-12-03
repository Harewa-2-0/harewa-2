import { Notification } from "@/lib/models/Notification";
import connectDB from "@/lib/db";
import { ok, badRequest } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth"; // optional
import { NextRequest } from "next/server";

// GET - Fetch notifications for current user
export async function GET(req: NextRequest) {
    await connectDB();
    const userid = requireAuth(req); // optional, if you want to restrict to authenticated users
    try {
        const userId = userid.sub; // from middleware or token
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return ok({ notifications });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return badRequest("Failed to fetch notifications");
    }
}

// PATCH - Mark notification as read
export async function PATCH(req: NextRequest) {
    await connectDB();

    try {
        const { id } = await req.json();
        await Notification.findByIdAndUpdate(id, { read: true });
        return ok({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Update notification error:", error);         
        return badRequest("Failed to update notification");
    }
}
