export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";

export async function GET() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL!;
    console.log("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID);
    console.log("REDIRECT_URI", REDIRECT_URI);
    const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authURL.searchParams.set("redirect_uri", REDIRECT_URI);
    authURL.searchParams.set("response_type", "code");
    authURL.searchParams.set("scope", "openid email profile");
    authURL.searchParams.set("prompt", "select_account");
    authURL.searchParams.set("include_granted_scopes", "true");
    authURL.searchParams.set("state", "pass-through value");

    return NextResponse.redirect(authURL.toString());
}
