import { Fabric } from "@/lib/models/Fabric";
import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { ok, created, badRequest } from "@/lib/response";

// GET /api/fabric
// Get all fabrics    
export async function GET() {
    await connectDB();
    const fabrics = await Fabric.find().lean();
    return ok(fabrics);
}
// POST /api/fabric
// Create a new fabric 
export async function POST(request: NextRequest) {
    await connectDB();
    const body = await request.json();
    if (!body.name) {
        return badRequest("Name is required");
    }
    const newFabric = new Fabric({
        name: body.name,
        description: body.description || "",
        owner: body.owner || "",
        location: body.location || ""
    });
    await newFabric.save();
    return created(newFabric);
}