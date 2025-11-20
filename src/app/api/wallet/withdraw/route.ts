export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { serverError, ok } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { deductFunds } from "@/lib/wallet";
import { initiatePaystackTransfer } from "@/lib/paystack";

// POST /api/wallet/withdraw
// withdraw funds from wallet
// This endpoint is used to withdraw funds to a user's local bank account
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, account_number, bank_code, amount, reason } = body;
        const user = requireAuth(request);
        const transfer = await initiatePaystackTransfer({
            name,
            account_number,
            bank_code,
            amount, // in naira
            reason: reason || "Wallet withdrawal"
        })
        const walletDetails = await deductFunds({
            amount: amount, userId: user.sub, reference: transfer.reference, description: reason || "Withdrawal from wallet"
        });

        if (!transfer) {
            return serverError("Failed to initiate transfer");
        } else { }
        console.log("Transfer initiated successfully:", transfer);
        return ok({
            walletDetails
        });
    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}