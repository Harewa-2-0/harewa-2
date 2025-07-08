import { Cart } from "@/lib/models/Cart";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created } from "@/lib/response";
import { requireAuth } from "@/lib/middleware/requireAuth";

// GET /api/cart
// Get all carts    
export async function GET() {
    await connectDB();
    const carts = await Cart.find().lean();
    return ok(carts);
}

// POST /api/cart
// Create a new cart 
export async function POST(request: NextRequest) {
    await connectDB();
    const body = await request.json();
    const decoded = requireAuth(request);
    const newCart = new Cart({ user: decoded.sub, products: body });
    await newCart.save();
    return created(newCart);
}        