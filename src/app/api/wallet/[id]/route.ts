import { Wallet } from "@/lib/models/Wallet";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, notFound, badRequest } from "@/lib/response";

// GET wallet by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const wallet = await Wallet.findById(params.id).lean();
        if (!wallet) {
            return notFound("Wallet not found");
        }

        return ok({
            success: true,
            message: "Wallet fetched successfully",
            data: wallet
        });
    } catch (error) {
        console.error("Failed to fetch wallet:", error);
        return badRequest("Failed to fetch wallet: " + error);
    }
}

// UPDATE wallet by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const body = await request.json();

    try {
        const updatedWallet = await Wallet.findByIdAndUpdate(params.id, body, { new: true }).lean();
        if (!updatedWallet) {
            return notFound("Wallet not found");
        }
        return ok({
            success: true,
            message: "Wallet updated successfully",
            data: updatedWallet
        });
    } catch (error) {
        console.error("Failed to update wallet:", error);
        return badRequest("Invalid wallet data: " + error);
    }
}

// DELETE wallet by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const deletedWallet = await Wallet.findByIdAndDelete(params.id).lean();
        if (!deletedWallet) {
            return notFound("Wallet not found");
        }

        return ok({
            success: true,
            message: "Wallet deleted successfully",
            data: deletedWallet
        });
    } catch (error) {
        console.error("Failed to delete wallet:", error);
        return badRequest("Failed to delete wallet: " + error);
    }
}
