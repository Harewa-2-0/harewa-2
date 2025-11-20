export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";

import { initializePayment2 } from "@/lib/paystack";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        if (!body.amount || !body.metadata) {
            return badRequest("Amount and metadata are required");
        }
        const user = requireAuth(request);

        const paymentInit = initializePayment2(
            user.email,
            body.amount,
            body.metadata,
        );

        return ok({
            success: true,
            message: "Payment initialized",
            data: paymentInit,
        });
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        return serverError("Failed to initialize payment: " + error);
    }
}