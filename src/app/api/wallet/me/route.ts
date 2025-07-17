// get my wallet details
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { ok } from "@/lib/response";
import { getWalletForUser } from "@/lib/wallet";

// POST /api/wa
// get my wallet details
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = requireAuth(request);

        const walletDetails = await getWalletForUser(user.sub);

        return ok(walletDetails);
    } catch (error) {
        return serverError("Failed to fetch wallet details: " + error);
    }
}