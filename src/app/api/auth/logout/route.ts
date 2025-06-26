import { NextResponse } from "next/server";

export async function POST() {
  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const deleteCookieOptions = `HttpOnly; Path=/; Max-Age=0; ${
    process.env.NODE_ENV === "production" ? "Secure; SameSite=Lax;" : ""
  }`;

  response.headers.append("Set-Cookie", `access-token=; ${deleteCookieOptions}`);
  response.headers.append("Set-Cookie", `refresh-token=; ${deleteCookieOptions}`);

  return response;
}
