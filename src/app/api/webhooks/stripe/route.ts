import { serverError, ok } from "@/lib/response";
import { verifyStripeWebhook } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
    const body = await req.text();
    const reqHeaders = await headers();
    const sig = reqHeaders.get("stripe-signature");

    if (!sig) {
        return serverError("Missing stripe signature");
    }

    try {
        const event = verifyStripeWebhook(body, sig);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("✅ Payment completed:", session);
            // TODO: mark order as paid in DB
            //call the confirm route to process the payment
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/stripe/confirm?session_id=${session.id}`);
        }

        return ok("success");
    } catch (err) {
        return new Response(`Webhook Error: ${err}`, { status: 400 });
    }
}
