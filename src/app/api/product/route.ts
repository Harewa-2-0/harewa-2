export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, } from "next/server";
import { Product } from "@/lib/models/Product";
import { ProductCategory } from "@/lib/models/ProductCategory";
import { Fabric } from "@/lib/models/Fabric";
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
    try {
        await connectDB();

        // Extract pagination parameters from query string
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
        const skip = (page - 1) * limit;

        // Optional filters
        const gender = searchParams.get('gender');
        const category = searchParams.get('category');
        const shop = searchParams.get('shop');
        const seller = searchParams.get('seller');

        let userId: string | null = null;
        let wishlistProductIds: Set<string> = new Set();

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;

            const wishlist = await Wishlist.findOne({ user: userId }).select('products').lean();
            if (wishlist && Array.isArray((wishlist as any).products)) {
                wishlistProductIds = new Set((wishlist as any).products.map((id: any) => id.toString()));
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            // User not authenticated — that's fine, we just skip wishlist logic
        }

        // Build query filters
        const query: any = {};
        if (gender) query.gender = gender;
        if (category) query.category = category;
        if (shop) query.shop = shop;
        if (seller) query.seller = seller;

        // Execute queries in parallel for better performance
        const [products, total] = await Promise.all([
            Product.find(query)
                .select('-__v') // Exclude version key
                .populate({
                    path: "category",
                    model: ProductCategory,
                    select: "name description", // Only fetch needed fields
                })
                .populate({
                    path: "fabricType",
                    model: Fabric,
                    select: "name type description", // Only fetch needed fields
                })
                .sort({ createdAt: -1 }) // Sort by newest first
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query) // Count total for pagination
        ]);

        // Add "favourite" field to each product if user is authenticated
        const enriched = products.map((product) => ({
            ...product,
            favourite: wishlistProductIds.has((product._id as any).toString()),
        }));

        // Return with pagination metadata
        // Note: ok() wraps this in { success: true, data: {...} }
        const response = {
            items: enriched,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + products.length < total,
            }
        };
        
        return ok(response);
    } catch (error) {
        console.error('[Product API] Error:', error);
        return Response.json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error' 
        }, { status: 500 });
    }
}
