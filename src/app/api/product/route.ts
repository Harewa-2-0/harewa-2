export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { Product } from "@/lib/models/Product";
import { ProductCategory } from "@/lib/models/ProductCategory";
import { Fabric } from "@/lib/models/Fabric";
import connectDB from "@/lib/db";
import { ok, created, serverError } from "@/lib/response";
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

        const { searchParams } = new URL(req.url);

        // Pagination
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const skip = (page - 1) * limit;

        // Filters
        const category = searchParams.get("category");
        const fabric = searchParams.get("fabric");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const search = searchParams.get("search");

        // Sorting
        const sortParam = searchParams.get("sort");
        let sortQuery: any = {};

        if (sortParam === "price_asc") sortQuery = { price: 1 };
        if (sortParam === "price_desc") sortQuery = { price: -1 };
        if (sortParam === "newest") sortQuery = { createdAt: -1 };
        if (sortParam === "oldest") sortQuery = { createdAt: 1 };

        // Build filter
        const filter: any = {};
        if (category) filter.category = category;
        if (fabric) filter.fabricType = fabric;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // Wishlist logic (optional)
        let userId: string | null = null;
        let wishlistProductIds: string[] = [];

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;

            const wishlist = await Wishlist.findOne({ user: userId });
            if (wishlist) {
                wishlistProductIds = wishlist.products.map((id: string) => id.toString());
            }
        } catch (error) {
            serverError("Authentication required for wishlist data");
        }

        // Total count
        const total = await Product.countDocuments(filter);

        // Fetch with populate + sorting + pagination
        const products = await Product.find(filter)
            .populate({
                path: "category",
                model: ProductCategory,
                select: ["name", "description", "id"],
            })
            .populate({
                path: "fabricType",
                model: Fabric,
            })
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .lean();

        // Add favourite field only for logged-in users
        const enriched = products.map((product) => ({
            ...product,
            favourite: wishlistProductIds.includes(product._id.toString()),
        }));

        return ok({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            count: enriched.length,
            data: enriched,
        });

    } catch (error) {
        return serverError(error);
    }
}
