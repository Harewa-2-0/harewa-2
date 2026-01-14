export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { User } from "@/lib/models/User";
import { Wallet } from "@/lib/models/Wallet";

// GET user profile
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
      select: "-_id email username phoneNumber isVerified role firstName lastName",
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

// DELETE user + profile
export async function DELETE(req: NextRequest) {
  try {
    const decoded = requireAuth(req);

    await dbConnect();

    // Delete the profile first (if exists)
    await Profile.findOneAndDelete({ user: decoded.sub });

    // delete associated wallet
    await Wallet.findOneAndDelete({ user: decoded.sub });

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(decoded.sub);

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message =
      err.message === "Unauthorized" ? "Unauthorized" : "Invalid token";
    const status = message === "Unauthorized" ? 401 : 403;

    return NextResponse.json({ message }, { status });
  }
}
