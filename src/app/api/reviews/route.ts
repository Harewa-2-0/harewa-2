export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Review } from "@/lib/models/Review";
import { Product } from "@/lib/models/Product";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { badRequest, ok } from "@/lib/response";

/**
 * POST /api/reviews
 * Create a new product review
 */
export async function POST(req: NextRequest) {
    await connectDB();
    const user = requireAuth(req);
    try {
        const { productId, orderId, rating, comment, images } =
            await req.json();

        if (!productId || !rating)
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        console.log("Creating review for product:", productId);
        const review = await Review.create({
            user: user.sub,
            product: productId,
            order: orderId,
            rating,
            comment,
            images,
        });

        // Optionally update product average rating
        const reviews = await Review.find({ product: productId });
        const avgRating =
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await Product.findByIdAndUpdate(productId, { avgRating });
        return ok(review);
    } catch (err) {
        console.error("Error creating review:", err);
        badRequest("Failed to create review: " + err);
    }
}

/**
 * GET /api/reviews?productId=...
 * Fetch all reviews for a product
 */
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId)
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });

        const reviews = await Review.find({ product: productId })
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return ok(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        return badRequest("Failed to fetch reviews: " + err);
    }
}
