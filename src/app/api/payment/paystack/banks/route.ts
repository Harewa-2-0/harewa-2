
import connectDB from "@/lib/db";
import { ok, badRequest, } from "@/lib/response";
import { getPaystackBanks } from "@/lib/paystack";

//  GET: Get all wallets
export async function GET() {
    await connectDB();

    try {
        const banks = await getPaystackBanks()

        return ok({
            banks,
        });
    } catch (error) {
        console.error("Failed to fetch wallets:", error);
        return badRequest("Failed to fetch wallets: " + error);
    }
}
