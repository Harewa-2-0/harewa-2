export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Review } from "@/lib/models/Review";
import { ok, badRequest, notFound } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";

/**
 * PATCH /api/reviews/[id]
 * - Toggle like/unlike
 * - OR update rating/comment (if provided)
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectDB();

    try {
        const { id } = await context.params;
        const user = requireAuth(req);
        const body = await req.json().catch(() => ({})); // handle empty body gracefully

        const review = await Review.findById(id);
        if (!review) return notFound("Review not found");

        // 🧠 Case 1: Like toggle
        if (Object.keys(body).length === 0) {
            const hasLiked = review.likes.includes(user.sub);
            if (hasLiked) {
                review.likes.pull(user.sub);
            } else {
                review.likes.push(user.sub);
            }
            await review.save();
            return ok({ message: "Like toggled", review });
        }

        // 🧠 Case 2: Update rating or comment (only review owner)
        if (review.user.toString() !== user.sub) {
            return badRequest("You can only edit your own review");
        }

        if (body.rating !== undefined) review.rating = body.rating;
        if (body.comment !== undefined) review.comment = body.comment;

        await review.save();

        return ok({ message: "Review updated successfully", review });
    } catch (err: unknown) {
        console.error("Error updating review:", err);
        return badRequest(`Failed to update review: ${err}`);
    }
}
