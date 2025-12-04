export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Cart } from "@/lib/models/Cart";
import { Product } from "@/lib/models/Product";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, serverError } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";
// import mongoose from "mongoose";

// GET /api/cart
// Get all carts    
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const decoded = requireAuth(request);

        const cart = await Cart.findOne({ user: decoded.sub })
            .sort({ createdAt: -1 })
            .populate({
                path: "products.product",
                model: Product,
            });

        if (!cart) {
            return ok({ products: [] }); // Empty cart response
        }

        // Format the response to flatten product + quantity

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const formattedProducts = Array.isArray(cart.products) && cart.products.length > 0
        //     ? cart.products
        //         .filter((item: any) => item?.product) // ✅ skip broken/null products
        //         .map((item: any) => ({
        //             _id: item.product._id,
        //             name: item.product.name,
        //             price: item.product.price,
        //             description: item.product.description,
        //             images: item.product.images,
        //             quantity: Number(item.quantity) || 0,
        //         }))
        //     : [];



        return ok({
            cart,
        });
    } catch (error) {
        console.error("Cart fetch error:", error);
        return serverError("Failed to fetch cart: " + error);
    }
}

// POST /api/cart
// Add items to cart (or create new cart)

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json(); // expect [{ product, quantity }]
        const decoded = requireAuth(request);

        let cart = await Cart.findOne({ user: decoded.sub })
            .sort({ createdAt: -1 });

        if (cart) {
            body.forEach((newItem: { product: string; quantity: number }) => {
                if (!newItem.product) return; // skip invalid
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const existingProduct = cart.products.find(
                    (p: any) => p?.product?.toString() === newItem.product
                );

                if (existingProduct) {
                    // ✅ replace with the sum
                    existingProduct.quantity = Number(existingProduct.quantity || 0) + Number(newItem.quantity || 0);
                } else {
                    // ✅ add as new product
                    cart.products.push({
                        product: newItem.product,
                        quantity: newItem.quantity || 1,
                    });
                }
            });

            await cart.save();
            return ok(cart);
        }

        // if no cart exists, create a new one
        const newCart = new Cart({
            user: decoded.sub,
            products: body.map((item: { product: string; quantity: number }) => ({
                product: item.product,
                quantity: item.quantity || 1,
            })),
        });

        await newCart.save();
        return created(newCart);
    } catch (error) {
        console.error("❌ Cart add error:", error);
        return serverError("Failed to update cart: " + error);
    }
}





