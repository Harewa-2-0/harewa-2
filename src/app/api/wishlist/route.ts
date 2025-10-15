export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Wishlist } from "@/lib/models/Wishlist";
import { Product } from "@/lib/models/Product";
import dbConnect from "@/lib/db";
import { NextRequest, } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { ok, badRequest, notFound, unauthorized } from "@/lib/response";


export async function POST(req: NextRequest) {
    try {
        const decoded = requireAuth(req);
        await dbConnect();

        const { productId } = await req.json();

        if (!productId) {
            return badRequest("Product ID is required");
        }

        const product = await Product.findById(productId);
        if (!product) {
            return notFound("Product not found");
        }

        let wishlist = await Wishlist.findOne({ user: decoded.sub });

        if (!wishlist) {
            wishlist = new Wishlist({ user: decoded.sub, products: [productId] });
            await wishlist.save();
            return ok({
                message: "Product added to wishlist",
                wishlist,
                added: true,
            });
        }

        const index = wishlist.products.findIndex(
            (id: unknown) => (id as string | { toString(): string }).toString() === productId
        );

        if (index > -1) {
            wishlist.products.splice(index, 1);
            await wishlist.save();
            return ok({
                message: "Product removed from wishlist",
                wishlist,
                added: false,
            });
        } else {
            wishlist.products.push(productId);
            await wishlist.save();
            return ok({
                message: "Product added to wishlist",
                wishlist,
                added: true,
            });
        }
    } catch (err) {
        return unauthorized("Unauthorized or token invalid" + err);
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const decoded = requireAuth(req);
        const userId = decoded.sub;

        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist || wishlist.products.length === 0) {
            return ok(wishlist);
        }

        const products = await Product.find({
            _id: { $in: wishlist.products },
        });

        return ok(products);
    } catch (err) {
        return unauthorized("Unauthorized or token invalid" + err);
    }
}