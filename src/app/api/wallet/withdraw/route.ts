
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { deductFunds } from "@/lib/wallet";

// POST /api/wallet/withdraw
// withdraw funds from wallet
// This endpoint is used to withdraw funds to a user's local bank account
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const user = requireAuth(request);
        await deductFunds({ amount: body.amount, userId: user.sub });
    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}