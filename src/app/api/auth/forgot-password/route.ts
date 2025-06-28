import { NextRequest, NextResponse } from "next/server";
import { signResetToken } from "@/lib/jwt";
import { User } from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
    await dbConnect();
    const body = await req.json();
    const { email } = body;

    const user = await User.findOne({ email });

    if (!user) {
        return NextResponse.json(
            { message: "Account does not exist. Create an account." },
            { status: 404 }
        );
    }
    const urlToken = signResetToken({
        id: user._id.toString(),
        email: user.email,
    });
    await sendResetEmail(user.email, `${process.env.NEXTAUTH_URL}/forgot-password?token=${urlToken}`);

    const response = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response;
}
