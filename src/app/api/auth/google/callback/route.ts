export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { User } from "@/lib/models/User";
import { Profile } from "@/lib/models/Profile";
import dbConnect from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
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
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
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
    email: profile.email,
    googleId: { $exists: false },
  });
  const firstName =
    typeof profile.given_name === "string" && profile.given_name.trim().length
      ? profile.given_name.trim()
      : undefined;
  const lastName =
    typeof profile.family_name === "string" && profile.family_name.trim().length
      ? profile.family_name.trim()
      : undefined;
  const displayName =
    typeof profile.name === "string" && profile.name.trim().length
      ? profile.name.trim()
      : profile.email.split("@")[0];

  if (existingUser) {
    existingUser.googleId = profile.id;
    existingUser.username = displayName;
    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;
    existingUser.isVerified = true;
    await existingUser.save();
  }
  let user = await User.findOne({
    googleId: profile.id,
    email: profile.email,
  });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.email,
      username: displayName,
      firstName,
      lastName,
      isVerified: true,
    });
  }

  // Ensure profile doc exists and carries social avatar/name metadata.
  const existingProfile = await Profile.findOne({ user: user._id });
  const picture =
    typeof profile.picture === "string" && profile.picture.trim().length
      ? profile.picture.trim()
      : undefined;
  if (!existingProfile) {
    await Profile.create({
      user: user._id,
      firstName: firstName ?? user.firstName ?? "",
      lastName: lastName ?? user.lastName ?? "",
      profilePicture: picture ?? "",
      bio: "",
      addresses: [],
    });
  } else {
    let changed = false;
    if (firstName && existingProfile.firstName !== firstName) {
      existingProfile.firstName = firstName;
      changed = true;
    }
    if (lastName && existingProfile.lastName !== lastName) {
      existingProfile.lastName = lastName;
      changed = true;
    }
    if (picture && existingProfile.profilePicture !== picture) {
      existingProfile.profilePicture = picture;
      changed = true;
    }
    if (changed) {
      await existingProfile.save();
    }
  }

  // 4) Sign tokens & set cookies
  const accessToken = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role || "admin",
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
        { 
          type: "oauth", 
          status: "success",
          user: {
            name: ${JSON.stringify(displayName)},
            picture: ${JSON.stringify(picture ?? "")},
            email: ${JSON.stringify(profile.email)}
          }
        },
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
