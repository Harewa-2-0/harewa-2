export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// app/api/admin/signup/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import {
  getAdminEmail,
  sendAdminVerificationEmail,
  sendVerificationEmail,
} from "@/lib/mailer";
import { generateUsername, generateVerificationCode, splitFullName } from "@/lib/utils";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";

const schema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    await connectDB();

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, email, password, role } = parsed.data;

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const joinedAt = new Date();
    const hashedPassword = await bcrypt.hash(password, 12);
    const username = await generateUsername(joinedAt, fullName);
    const verificationCode = generateVerificationCode();
    const nameParts = await splitFullName(fullName);
    const { firstName, lastName } = nameParts;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      username,
      verificationCode,
      isVerified: false,
      joinedAt,
      role: role == "admin" ? "admin" : "client",
    });

    await newUser.save();
    console.log("✅ New user created:", newUser.email, "as", newUser.role);

    try {
      if (newUser.role == "admin" && getAdminEmail()) {
        await sendAdminVerificationEmail(newUser.email, verificationCode);
      } else {
        await sendVerificationEmail(email, verificationCode);
      }
    } catch (emailError) {
      console.error("Sign-up verification email failed:", emailError);
      return NextResponse.json(
        {
          message:
            "Account created, but we could not send the verification email. Please try resend or contact support.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message:
          newUser.role === "admin"
            ? `Verification code sent to ${getAdminEmail()}`
            : "Verification code sent to your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Sign-Up Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
