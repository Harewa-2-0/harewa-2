import { CustomRequest } from "@/lib/models/CustomRequest";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { ok, badRequest, unauthorized, serverError, notFound } from "@/lib/response";
import { NextRequest } from "next/server";

// Create a new custom request
export async function POST(req: NextRequest) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const { gender, style, fitType, color, budget, description, image } = await req.json();

        if (!gender || !style || !fitType || !color || !budget || !description || !image) {
            return badRequest("All fields are required");
        }

        const customRequest = new CustomRequest({
            user: decoded.sub,
            gender,
            style,
            fitType,
            color,
            budget,
            description,
            image,
            history: [{ status: "pending", note: "Request created" }]
        });

        await customRequest.save();

        return ok({ message: "Custom request created successfully", customRequest });
    } catch (err) {
        return unauthorized("Unauthorized or token invalid: " + err);
    }
}

// Get all requests for logged-in user
export async function GET(req: NextRequest) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const requests = await CustomRequest.find({ user: decoded.sub });

        return ok(requests);
    } catch (err) {
        return serverError("Failed to fetch requests: " + err);
    }
}

// Update request status
export async function PATCH(req: NextRequest) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const { requestId, status, note } = await req.json();

        if (!requestId || !status) {
            return badRequest("Request ID and status are required");
        }

        const request = await CustomRequest.findById(requestId);
        if (!request) return notFound("Custom request not found");

        request.status = status;
        request.updatedBy = decoded.sub;
        request.history.push({ status, note });

        await request.save();

        return ok({ message: "Status updated successfully", request });
    } catch (err) {
        return serverError("Failed to update status: " + err);
    }
}
