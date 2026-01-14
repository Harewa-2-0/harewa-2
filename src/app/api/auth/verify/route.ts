export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { verifyOtpAndGenerateToken } from "@/lib/otp";
import type { VerifiedAdmin } from "@/lib/types/auth";
import { sendWelcomeEmail } from "@/lib/mailer";
import connectDB from "@/lib/db";
import { Profile } from "@/lib/models/Profile";
import { Wallet } from "@/lib/models/Wallet";

export async function POST(req: Request) {
  const { otp, email } = await req.json();

  try {
    const { user, accessToken, refreshToken } = await verifyOtpAndGenerateToken(otp, email);

    await connectDB();

    const newProfile = new Profile({
      user: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });

    await newProfile.save();

    const newWallet = new Wallet({
      user: user.id,
      transactions: [
        {
          reference: `init-${Date.now()}`,
          amount: 0,
          type: "credit",
          status: "success",
          gateway: "system",
          narration: "Initial wallet setup",
        },
      ],
    });
    await newWallet.save();
    console.log("✅ New wallet created for user:", newWallet.u);

    const accessCookie = serialize("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const refreshCookie = serialize("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Use response.headers.append() for multiple Set-Cookie values
    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    const welcomeName = user.firstName ? (user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName) : (user.username || '');
    await sendWelcomeEmail(user.email, welcomeName);

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Unknown error" },
      { status: 500 }
    );
  }
}
