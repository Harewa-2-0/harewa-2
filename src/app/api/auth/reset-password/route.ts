export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { verifyResetToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    const payload = verifyResetToken(token);

    if (!payload) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const { sub } = payload;

    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
        return NextResponse.json({ message: "Password too short" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findById(sub);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();


    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
}
