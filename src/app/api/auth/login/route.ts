import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";
import { generateVerificationCode } from "@/lib/utils";

async function verifyPassword(input: string, hashed: string) {
  return bcrypt.compare(input, hashed);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { email, password } = body;

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { message: "Account does not exist. Create an account." },
      { status: 404 }
    );
  }
  if (!(await verifyPassword(password, user.password))) {
    return NextResponse.json(
      { message: "Wrong Password. Reset it if you forgot it." },
      { status: 401 }
    );
  }
  if (user.accountDeleted) {
    return NextResponse.json(
      { message: "User Account deleted" },
      { status: 403 }
    );
  }
  if (user.isVerified === false) {
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();
    await sendVerificationEmail(email, verificationCode);
    return NextResponse.json(
      { message: "User is not verified, verify your acount." },
      { status: 403 }
    );
  }

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

  const accessCookie = `access-token=${accessToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7
    }; ${process.env.NODE_ENV === "production" ? "Secure; SameSite=Lax;" : ""}`;

  const refreshCookie = `refresh-token=${refreshToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7
    }; ${process.env.NODE_ENV === "production" ? "Secure; SameSite=Lax;" : ""}`;

  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Use response.headers.append() for multiple Set-Cookie values
  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);

  return response;
}
