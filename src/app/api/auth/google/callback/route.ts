import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { User } from "@/lib/models/User";
import dbConnect from "@/lib/db";

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL  = process.env.GOOGLE_CALLBACK_URL!;

export async function GET(req: NextRequest) {
  await dbConnect();

  const url  = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=NoCode", req.url));
  }

  // 1) Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  GOOGLE_CALLBACK_URL,
      grant_type:    "authorization_code",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/login?error=TokenExchangeFailed", req.url));
  }

  // 2) Fetch Google profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profile.email || !profile.id) {
    return NextResponse.redirect(new URL("/login?error=NoProfile", req.url));
  }

  // 3) Upsert user
  const existingUser = await User.findOne({
    email:    profile.email,
    googleId: { $exists: false },
  });
  if (existingUser) {
    existingUser.googleId   = profile.id;
    existingUser.username   = profile.name || profile.email.split("@")[0];
    existingUser.isVerified = true;
    await existingUser.save();
  }
  let user = await User.findOne({
    googleId: profile.id,
    email:    profile.email,
  });
  if (!user) {
    user = await User.create({
      googleId:   profile.id,
      email:      profile.email,
      username:   profile.name || profile.email.split("@")[0],
      isVerified: true,
    });
  }

  // 4) Sign tokens & set cookies
  const accessToken = signAccessToken({
    id:    user._id.toString(),
    email: user.email,
    role:  user.role || "admin",
  });
  const { token: refreshToken, jti: newJTI } = signRefreshToken(user._id.toString());
  user.refreshTokenJTI = newJTI;
  await user.save();

  const accessCookie = [
    `access-token=${accessToken}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${60 * 60 * 24 * 7}`,
    process.env.NODE_ENV === "production" ? "Secure; SameSite=Lax" : "",
  ].filter(Boolean).join("; ");

  const refreshCookie = [
    `refresh-token=${refreshToken}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${60 * 60 * 24 * 7}`,
    process.env.NODE_ENV === "production" ? "Secure; SameSite=Lax" : "",
  ].filter(Boolean).join("; ");

  // — instead of redirecting the popup to “/”, render a tiny HTML page
  //   that notifies the opener and then self‐closes:
  const html = `<!DOCTYPE html>
<html>
  <body>
    <script>
      // 1) Tell the parent window we succeeded
      window.opener.postMessage(
        { type: "oauth", status: "success" },
        window.origin
      );
      // 2) Close the popup
      window.close();
    </script>
  </body>
</html>`;

  const response = new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);
  return response;
}
