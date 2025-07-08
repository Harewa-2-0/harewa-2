// lib/otp.ts

import dbConnect from "@/lib/db";
import { User } from "./models/User";
import { signAccessToken, signRefreshToken } from "./jwt";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export async function verifyOtpAndGenerateToken(otp: string, email: string) {
  await dbConnect();
  const user = await User.findOne({ verificationCode: otp, email });


  if (!user) throw new Error("Invalid or expired OTP");

  user.isVerified = true;
  user.verificationCode = null;

  const accessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role || "admin",
  });

  const { token: refreshToken, jti: newJTI } = signRefreshToken(
    user._id.toString()
  );

  user.refreshTokenJTI = newJTI;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      joinedAt: user.joinedAt,
      username: user.username,
    },
  };
}
