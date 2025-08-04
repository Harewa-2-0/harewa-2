import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { User } from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const decoded = requireAuth(req);

    await dbConnect();
    const user = await User.findOne({ _id: decoded.sub });
    if (!user) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }
    const profile = await Profile.findOne({ user: user._id }).populate({
      path: "user",
      select: "-_id email username phoneNumber isVerified role",
    });

    return NextResponse.json({ profile });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message =
      err.message === "Unauthorized" ? "Unauthorized" : "Invalid token";
    const status = message === "Unauthorized" ? 401 : 403;

    return NextResponse.json({ message }, { status });
  }
}
