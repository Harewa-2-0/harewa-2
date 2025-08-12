// src/utils/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const DEFAULT_TIMEOUT = 15000;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type MaybeWrapped<T> = { success?: boolean; data?: T } | T;

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// Join API_BASE + path safely
function buildUrl(path: string) {
  if (path.startsWith("http")) return path;
  if (!API_BASE) return path; // same-origin
  try {
    return new URL(
      path.replace(/^\//, ""),
      API_BASE.endsWith("/") ? API_BASE : API_BASE + "/"
    ).toString();
  } catch {
    return `${API_BASE}${path}`;
  }
}

// Decide headers only when needed (don’t set for FormData)
function withJson(init: RequestInit): RequestInit {
  const isFormData =
    typeof window !== "undefined" && init.body instanceof FormData;
  return {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  };
}

/** Tiny fetch wrapper with timeout + cookie auth + better errors */
export async function api<T = any>(
  path: string,
  init: RequestInit = {},
  opts: { timeout?: number } = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeout ?? DEFAULT_TIMEOUT
  );

  const url = buildUrl(path);

  try {
    const res = await fetch(url, {
      credentials: "include",
      signal: controller.signal,
      ...init,
    });

    // 204/205: no content to parse
    if (res.status === 204 || res.status === 205) {
      if (!res.ok)
        throw new ApiError(res.statusText || `HTTP ${res.status}`, res.status);
      return undefined as unknown as T;
    }

    const ct = res.headers.get("content-type") || "";
    let body: any = null;

    if (ct.includes("application/json")) {
      body = await res.json().catch(() => null);
    } else {
      const text = await res.text();
      // Try JSON if it looks like it
      if (text && (text.startsWith("{") || text.startsWith("["))) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      } else {
        body = text;
      }
    }

    if (!res.ok) {
      const msg =
        (body &&
          typeof body === "object" &&
          "message" in body &&
          (body as any).message) ||
        res.statusText ||
        `HTTP ${res.status}`;
      throw new ApiError(String(msg), res.status, body);
    }

    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

/** SWR/React Query compatible fetcher */
export const fetcher = <T = any>(url: string) => api<T>(url);

/** Helper to normalize {success,data} or bare data */
export function unwrap<T>(payload: MaybeWrapped<T>): T {
  if (payload && typeof payload === "object" && "data" in (payload as any)) {
    return ((payload as any).data ?? null) as T;
  }
  return payload as T;
}

/** Convenience for JSON POST-style requests */
export const json = (body: unknown): RequestInit =>
  withJson({ method: "POST", body: JSON.stringify(body) });
