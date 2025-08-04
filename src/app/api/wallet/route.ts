import { Wallet } from "@/lib/models/Wallet";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";

//  GET: Get all wallets
export async function GET() {
    await connectDB();

    try {
        const wallets = await Wallet.find().populate("user").lean();

        return ok({
            success: true,
            message: "Wallets fetched successfully",
            data: wallets,
        });
    } catch (error) {
        console.error("Failed to fetch wallets:", error);
        return badRequest("Failed to fetch wallets: " + error);
    }
}

//  POST: Create wallet for authenticated user
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const user = requireAuth(request);

        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({ user: user.sub });
        if (existingWallet) {
            return badRequest("Wallet already exists for this user.");
        }

        // Create new wallet
        const newWallet = new Wallet({
            user: user.sub,
            balance: 0,
            transactions: [],
        });

        await newWallet.save();

        return created({
            success: true,
            message: "Wallet created successfully",
            data: newWallet,
        });
    } catch (error) {
        console.error("Failed to create wallet:", error);
        return serverError("Failed to create wallet: " + error);
    }
}
