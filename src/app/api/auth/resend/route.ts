export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { generateOtp } from "@/lib/otp";
import {
  getAdminEmail,
  resendOtpEmail,
  sendAdminVerificationEmail,
} from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const otp = generateOtp();

  user.verificationCode = otp;
  await user.save();

  if (user.role === "admin" && getAdminEmail()) {
    await sendAdminVerificationEmail(user.email, otp);
  } else {
    await resendOtpEmail(email, otp);
  }

  return NextResponse.json(
    { message: "OTP sent successfully" },
    { status: 200 }
  );
}
