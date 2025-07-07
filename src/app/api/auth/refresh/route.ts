import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "@/lib/jwt";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh-token")?.value;
  const isProd = process.env.NODE_ENV === "production";

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No refresh token provided" },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);

    if (!user) throw new Error("Invalid user");

    // 🚨 Reuse detection
    if (user.refreshTokenJTI && user.refreshTokenJTI !== decoded.jti) {
      console.warn("Possible refresh token reuse detected.");
      user.refreshTokenJTI = null;
      await user.save();
      return NextResponse.json(
        { message: "Token reuse detected" },
        { status: 403 }
      );
    }

    const newAccessToken = signAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role || "admin",
    });

    const { token: newRefreshToken, jti: newJTI } = signRefreshToken(
      user._id.toString()
    );

    user.refreshTokenJTI = newJTI;
    await user.save();

    const accessCookie = `access-token=${newAccessToken}; HttpOnly; Path=/; Max-Age=${
      60 * 60 * 24 * 7
    }; ${isProd ? "Secure; SameSite=Lax;" : ""}`;

    const refreshCookie = `refresh-token=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${
      60 * 60 * 24 * 7
    }; ${isProd ? "Secure; SameSite=Lax;" : ""}`;

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 403 }
    );
  }
}
