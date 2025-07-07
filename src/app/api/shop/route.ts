import { Shop } from "@/lib/models/Shop";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest } from "@/lib/response";

// GET /api/shop
// Get all shops    
export async function GET() {
    await connectDB();
    const shops = await Shop.find().lean();
    return ok(shops);
}
// POST /api/shop
// Create a new shop 
export async function POST(request: NextRequest) {
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    const newShop = new Shop({
        name: body.name,
        description: body.description || "",
        owner: body.owner || "",
        location: body.location || ""
    });
    await newShop.save();
    return created(newShop);
}