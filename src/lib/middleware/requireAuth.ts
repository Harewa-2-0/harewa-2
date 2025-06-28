import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("access-token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = verifyAccessToken(token);
  return decoded; // Contains { sub, email, role, type }
}

export function validatorAccess(req: NextRequest) {
  const token = req.cookies.get("validatorToken")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = verifyAccessToken(token);
  return decoded;
}