// src/services/auth.ts
import { api } from "@/utils/api";

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role: string;
  avatar?: string;
  isVerified?: boolean;
};

function cleanStr(v: unknown): string | undefined {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  return undefined;
}

let getMeInflight: Promise<any> | null = null;

function toUserProfile(payload: any): UserProfile {
  // Accept multiple backend shapes without leaking tokens
  const data = payload?.data ?? payload;
  const profile = data?.profile ?? data?.user ?? data;

  // Some backends nest the "user" node inside "profile"
  const userNode = profile?.user ?? profile;

  const first = cleanStr(profile?.firstName);
  const last = cleanStr(profile?.lastName);
  const compositeFull =
    [first, last].filter(Boolean).join(" ") || undefined;

  const email = cleanStr(userNode?.email) ?? "";
  const id =
    cleanStr(profile?._id) ??
    cleanStr(userNode?.id) ??
    cleanStr(userNode?._id) ??
    "";

  // Map backend roles to frontend roles
  const backendRole = cleanStr(userNode?.role) ?? "client";
  const role = backendRole === "client" ? "user" : backendRole;

  return {
    id,
    email,
    name: cleanStr(userNode?.username) ?? cleanStr(userNode?.name),
    fullName:
      cleanStr(userNode?.name) ??
      cleanStr(userNode?.username) ??
      compositeFull,
    role,
    avatar: cleanStr(userNode?.avatar) ?? cleanStr(userNode?.picture) ?? cleanStr(profile?.profilePicture),
    isVerified:
      typeof userNode?.isVerified === "boolean"
        ? userNode.isVerified
        : typeof profile?.isVerified === "boolean"
        ? profile.isVerified
        : undefined,
  };
}

/** Email/password login — relies on HttpOnly cookies set by server */
export async function loginWithEmail(params: { email: string; password: string }) {
  const data = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: params.email.trim(),
      password: params.password, // don't trim passwords
    }),
  });
  // Do NOT return tokens even if backend includes them
  return { user: toUserProfile(data) };
}

/** Get current user from server session (cookies) */
export async function getMe() {
  if (!getMeInflight) {
    getMeInflight = api("/api/auth/me", { method: "GET" })
      .finally(() => { getMeInflight = null; });
  }
  const data = await getMeInflight;
  return { user: toUserProfile(data) };
}

/** Logout on server (best-effort). Cookies are HttpOnly so server should clear them. */
export async function logoutServer() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore; client will still clear local UI state
  }
}

/** Delete current user account */
export async function deleteCurrentUser() {
  // The api() utility returns parsed JSON data, not the Response object
  // If the request succeeds, we'll get the data back
  // If it fails, api() will throw an error
  const data = await api("/api/auth/me", {
    method: "DELETE",
  });
  
  // Return the response data (e.g., {"message": "User deleted successfully"})
  return data;
}

/** OAuth entry (opened in popup by the UI) */
export const GOOGLE_OAUTH_URL = "/api/auth/google";