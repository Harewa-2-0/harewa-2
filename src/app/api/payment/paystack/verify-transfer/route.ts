export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/response";
import { finalizePaystackTransfer, } from "@/lib/paystack";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { otp, transfer_code } = body;
        if (!otp || !transfer_code) {
            return badRequest("OTP and transfer code are required");
        }

        const verifyPayment = await finalizePaystackTransfer(transfer_code, otp);

        return ok({
            success: true,
            message: "Trasfer initialized",
            data: verifyPayment,
        });
    } catch (error) {
        console.error("Failed to initialize payment:", error);
        return serverError("Failed to initialize payment: " + error);
    }
}