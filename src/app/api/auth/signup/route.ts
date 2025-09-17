// app/api/admin/signup/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sendAdminVerificationEmail, sendVerificationEmail } from "@/lib/mailer";
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
    const username = await generateUsername(joinedAt);
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
    console.log("✅ New user created:", newUser.email, "as", newUser.role, process.env.ADMIN_EMAI);
    if (newUser.role == "admin" && `${process.env.ADMIN_EMAIL}`) {
      await sendAdminVerificationEmail(`${process.env.ADMIN_EMAIL}`, newUser.email, verificationCode);
    } else {
      await sendVerificationEmail(email, verificationCode);
    }

    return NextResponse.json(
      { message: "Verification code sent to your email" },
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
