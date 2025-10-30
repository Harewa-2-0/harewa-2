import { createCheckoutSession } from "@/lib/stripe";
import { NextRequest, } from "next/server";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const session = await createCheckoutSession({
            amount: body.amount,
            email: body.email,
            successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
            metadata: {
                items: body.items ?? [],
                type: body.type ?? "",
                amount: Number(body.amount ?? 0),
                uuid: body.uuid ?? "",
                orderId: body.orderId ?? "",
            },
        });

        return Response.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error("Stripe create-session error:", err);
        return Response.json({ error: err }, { status: 400 });
    }
}
