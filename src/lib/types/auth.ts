// types/auth.ts
import { Types } from 'mongoose';


export interface VerifiedAdmin {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    joinedAt: Date;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface JwtAdminPayload {
  id: string;
  email: string;
}

// types/auth.ts

export interface JwtAccessTokenPayload {
  sub: string; // user ID
  email: string;
  role?: string; // optional if you're doing RBAC
  type: "access";
  iat?: number;
  exp?: number;
}

export interface JwtRefreshTokenPayload {
  sub: string;
  jti: string; // unique token ID, helpful for revoking/rotation
  type: "refresh";
  iat?: number;
  exp?: number;
}

export interface JwtValidatorTokenPayload {
  sub: string;
  type: "access";
  iat?: number;
  exp?: number;
  email?: string;
}

export interface Iuser {
  _id: string | Types.ObjectId;
  email: string;
  [key: string]: unknown;
};