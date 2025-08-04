// POST /api/wallet/receipt
// Send receipt for a specific transaction
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, serverError, badRequest } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { getTransactionByReference } from "@/lib/wallet";
import { sendReceiptMail } from "@/lib/sendReceipts";
// import { ITransaction } from "@/lib/types/wallet";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            return badRequest("Transaction reference is required");
        }

        const user = requireAuth(request);

        // Get the transaction by reference
        const transactionData = await getTransactionByReference({
            reference,
            userId: user.sub
        });
        const transaction = await transactionData.json();
        if (!transaction) {
            return badRequest("Transaction not found");
        }
        console.log("Transaction found:", transactionData);
        // Send receipt email
        await sendReceiptMail({
            to: user.email,
            subject: "Payment Receipt",
            data: {
                customerName: user.email || "Customer",
                receiptId: transaction.data.reference,
                amountPaid: transaction.data.amount || 0,
                paymentMethod: transaction.data.type || "Wallet",
                date: new Date().toISOString().split('T')[0],
            }
        });

        return ok({
            success: true,
            message: "Receipt sent successfully",
            data: {
                reference: transaction?.reference,
                emailSent: true
            }
        });

    } catch (error) {
        console.error("Error sending receipt:", error);
        return serverError("Failed to send receipt: " + error);
    }
}