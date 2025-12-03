// lib/jwt.ts

import jwt from "jsonwebtoken";
import { JwtAccessTokenPayload, JwtRefreshTokenPayload, JwtValidatorTokenPayload } from "./types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signAccessToken(user: { id: string; email: string; role?: string }) {
  const payload: JwtAccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  const jti = crypto.randomUUID();
  const payload: JwtRefreshTokenPayload = {
    sub: userId,
    jti,
    type: "refresh",
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  return { token, jti };
}

export function verifyAccessToken(token: string): JwtAccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded !== "object" || !decoded || decoded.type !== "access") {
    throw new Error("Invalid access token");
  }

  return decoded as JwtAccessTokenPayload;
}

export function verifyRefreshToken(token: string): JwtRefreshTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded !== "object" || !decoded || decoded.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return decoded as JwtRefreshTokenPayload;
}


export function signResetToken(user: { id: string; email: string; }) {
  const payload: JwtValidatorTokenPayload = {
    sub: user.id,
    email: user.email,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7m" });
}

export function verifyResetToken(token: string): JwtAccessTokenPayload {


  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded !== "object" || !decoded || decoded.type !== "access") {
    throw new Error("Invalid access token");
  }

  return decoded as JwtAccessTokenPayload;
}

