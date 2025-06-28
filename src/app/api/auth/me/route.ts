import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";

export async function GET(req: NextRequest) {
  try {
    const decoded = requireAuth(req);

    await dbConnect();
    const user = await Profile.find({ user: decoded.sub });

    if (!user) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message =
      err.message === "Unauthorized" ? "Unauthorized" : "Invalid token";
    const status = message === "Unauthorized" ? 401 : 403;

    return NextResponse.json({ message }, { status });
  }
}
