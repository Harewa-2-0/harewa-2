export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
// import { addFunds } from "@/lib/wallet";
import { initializePayment2 } from "@/lib/paystack";
import { ok } from "@/lib/response";
import { getUserFromUserid } from "@/lib/utils";
import { Iuser } from "@/lib/types/auth";

// POST /api/wa
// add funds to wallet
// This endpoint is used to add funds to a user's wallet 
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        if (!body.amount || !body.metadata || !body.gateway) {
            return serverError("Amount, metadata, and gateway are required");
        }
        const user = requireAuth(request);
        const userDetails: Iuser = await getUserFromUserid(user.sub);

        if (body.gateway === "paystack") {
            const metadata = {
                ...body.metadata,
                uuid: userDetails.uuid,
                type: "wallet",
                amount: body.amount,
            };

            const paymentInit = await initializePayment2(
                user.email,
                body.amount,
                metadata,
            );

            return ok({
                paymentInit,
            });
        }

    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}