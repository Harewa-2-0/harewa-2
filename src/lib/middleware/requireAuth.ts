import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("access-token")?.value;

  if (!token) {
    throw new Error("No access token provided");
  }

  try {
    const decoded = verifyAccessToken(token);
    return decoded; // Contains { sub, email, role, type }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.message?.includes('expired')) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}

export function validatorAccess(req: NextRequest) {
  const token = req.cookies.get("validatorToken")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = verifyAccessToken(token);
  return decoded;
}