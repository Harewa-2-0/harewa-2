import { NextRequest, } from "next/server";
import { Product } from "@/lib/models/Product";
import connectDB from "@/lib/db";
import { ok, created, } from "@/lib/response";
import { Wishlist } from "@/lib/models/Wishlist";
import { requireAuth } from "@/lib/middleware/requireAuth";


// Create product
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const product = new Product(body);
        await Product.create(product);
        return created(product);
    } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await connectDB();

    let userId: string | null = null;
    let wishlistProductIds: string[] = [];

    try {
        const decoded = requireAuth(req);
        userId = decoded.sub;

        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            wishlistProductIds = wishlist.products.map((id: string) => id.toString());
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        // User not authenticated — that's fine, we just skip wishlist logic
    }

    const products = await Product.find().lean();

    // Add "favourite" field to each product if user is authenticated
    const enriched = products.map((product) => ({
        ...product,
        favourite: wishlistProductIds.includes((product._id as string | { toString(): string }).toString()),
    }));

    return ok(enriched);
}
