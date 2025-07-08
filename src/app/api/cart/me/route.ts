import { Cart } from "@/lib/models/Cart";
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
        const carts = await Cart.find({ user: decoded.sub }).lean();
        return ok(carts);
    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}


export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json(); // should be an array of products
        const decoded = requireAuth(request);

        const cart = await Cart.findOne({ user: decoded.sub });

        if (cart) {
            cart.products = [...cart.products, ...body];

            console.log(cart.products);
            await cart.save();
            return ok(cart);
        }

        const newCart = new Cart({
            user: decoded.sub,
            products: body
        });

        await newCart.save();
        return created(newCart);
    } catch (error) {
        return serverError(
            "Failed to fetch cart: " + error);
    }
}



