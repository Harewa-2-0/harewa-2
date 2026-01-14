import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * ✅ Create a Stripe Checkout Session
 */
export async function createCheckoutSession({
    amount,
    currency = "usd",
    email,
    metadata,
    successUrl,
    cancelUrl,
}: {
    amount: number;
    currency?: string;
    email: string;
    metadata: {
        items?: any[];
        type: string;
        amount: number;
        uuid: string;
        orderId: string;
    };
    successUrl: string;
    cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: metadata.type || "Purchase",
                        description: `Order #${metadata.orderId}`,
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,

        // ✅ Metadata goes here
        metadata: {
            orderId: metadata.orderId,
            uuid: metadata.uuid,
            amount: metadata.amount?.toString() || "0",
            type: metadata.type,
            items: JSON.stringify(metadata.items || []),
        },
    });

    return session;
}

/**
 * ✅ Verify and parse a Stripe webhook event
 */
export function verifyStripeWebhook(
    rawBody: string | Buffer,
    signature: string
): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    if (!webhookSecret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    }

    try {
        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        ) as Stripe.Event;
        return event;
    } catch (err: unknown) {
        const message = (err as Error)?.message ?? String(err);
        console.error("⚠️ Stripe webhook verification failed:", message);
        throw new Error(`Invalid webhook signature: ${message}`);
    }
}

/**
 * ✅ Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
    sessionId: string
): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session as Stripe.Checkout.Session;
}

/**
 * ✅ Retrieve a payment intent by ID
 */
export async function getPaymentIntent(
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return pi as Stripe.PaymentIntent;
}

/**
 * ✅ Refund a payment
 * @param paymentIntentId - Payment intent ID to refund
 * @param amount - Optional partial refund amount (in dollars)
 */
export async function refundPayment(
    paymentIntentId: string,
    amount?: number
): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
    };

    if (typeof amount === "number") {
        params.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(params);
    return refund as Stripe.Refund;
}
