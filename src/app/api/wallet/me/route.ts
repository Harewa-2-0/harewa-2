export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/wa
// Get my wallet details
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { getWalletForUser } from "@/lib/wallet";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = requireAuth(request);

        const walletDetails = await getWalletForUser(user.sub);

        return ok({
            walletDetails,
        });
    } catch (error) {
        return serverError("Failed to fetch wallet details: " + error,
        );
    }
}
