// src/utils/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const DEFAULT_TIMEOUT = 30000; // Increased to 30s

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

// In-flight GET request deduplication to avoid duplicate network calls
const pendingGetRequests = new Map<string, Promise<any>>();

// ===== helpers =====

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

// Decide headers only when needed (don't set for FormData)
// Normalizes Headers instances and plain objects to a plain object before merging.
function withJson(init: RequestInit): RequestInit {
  // normalize incoming headers to a plain object
  let incomingHeaders: Record<string, any> = {};
  if (init.headers instanceof Headers) {
    init.headers.forEach((v, k) => {
      incomingHeaders[k] = v;
    });
  } else if (init.headers && typeof init.headers === "object") {
    // covers Record<string,string> and plain objects
    incomingHeaders = { ...(init.headers as Record<string, any>) };
  }

  const isFormData =
    typeof window !== "undefined" && init.body instanceof FormData;

  return {
    ...init,
    headers: {
      ...incomingHeaders,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  };
}

// Parse response body (json or text → best-effort json)
async function parseBody(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json().catch(() => null);
  }
  const text = await res.text();
  if (text && (text.startsWith("{") || text.startsWith("["))) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

// Detect "access token expired" shapes from backend
function isAccessExpired(status: number, body: any) {
  if (status !== 401) return false;
  const code =
    body?.error?.code ||
    body?.code ||
    (typeof body?.error === "string" ? body.error : undefined);
  const msg = (body?.message || body)?.toString?.().toLowerCase?.() || "";
  return (
    code === "TOKEN_EXPIRED" ||
    code === "ACCESS_TOKEN_EXPIRED" ||
    msg.includes("token expired") ||
    msg.includes("jwt expired") ||
    msg.includes("access token expired")
  );
}

// Detect "invalid token" that should trigger refresh (malformed/corrupted tokens)
function isInvalidToken(status: number, body: any) {
  if (status !== 403) return false;
  const msg = (body?.message || body)?.toString?.().toLowerCase?.() || "";
  return msg.includes("invalid token");
}

// ===== refresh single-flight =====
let refreshPromise: Promise<void> | null = null;
let refreshInProgress = false;

async function doRefreshOnce(): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 10000); // 10s timeout for refresh
  
  try {
    const res = await fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timer);
    
    if (!res.ok) {
      const body = await parseBody(res);
      console.error('[API] Refresh failed:', res.status, body);
      const msg =
        (body && (body.error?.message || body.error || body.message)) ||
        res.statusText ||
        "Refresh failed";
      throw new ApiError(String(msg), res.status, body);
    }
    
    //console.log('[API] Token refresh successful');
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.error('[API] Refresh request timed out');
      throw new ApiError('Token refresh timed out', 0, { reason: 'timeout' });
    }
    throw err;
  }
}

async function ensureRefresh(): Promise<void> {
  if (refreshInProgress) {
    //console.log('[API] Waiting for existing refresh...');
  }
  
  if (!refreshPromise) {
    refreshInProgress = true;
    refreshPromise = doRefreshOnce().finally(() => {
      refreshPromise = null;
      refreshInProgress = false;
    });
  }
  return refreshPromise;
}

/** Tiny fetch wrapper with timeout + cookie auth + auto refresh/retry + better errors */
export async function api<T = any>(
  path: string,
  init: RequestInit = {},
  opts: { timeout?: number } = {}
): Promise<T> {
  const url = buildUrl(path);
  const timeoutMs = opts.timeout ?? DEFAULT_TIMEOUT;

  //console.log(`[API] ${init.method || 'GET'} ${url} (timeout: ${timeoutMs}ms)`);

  // Clone the body if it exists so we can retry with the same data
  let bodyForRetry: any = null;
  if (init.body) {
    if (typeof init.body === 'string') {
      bodyForRetry = init.body;
    } else if (init.body instanceof FormData) {
      // FormData can't be cloned easily, so we'll just use the original
      bodyForRetry = init.body;
    } else {
      // For other types, try to stringify
      try {
        bodyForRetry = JSON.stringify(init.body);
      } catch {
        bodyForRetry = init.body;
      }
    }
  }

  async function runOnce(isRetry = false): Promise<{ res: Response; body: any }> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      console.error(`[API] Request timeout after ${timeoutMs}ms: ${url}`);
      controller.abort();
    }, timeoutMs);
    
    try {
      const startTime = Date.now();
      
      // On retry, reconstruct the request with the saved body
      const fetchInit: RequestInit = {
        credentials: "include",
        signal: controller.signal,
        ...init,
      };
      
      // If this is a retry and we have a body, use the cloned version
      if (isRetry && bodyForRetry !== null) {
        fetchInit.body = bodyForRetry;
      }
      
      const res = await fetch(url, fetchInit);
      const elapsed = Date.now() - startTime;
      //console.log(`[API] Response received in ${elapsed}ms: ${res.status} ${url}`);

      // 204/205: no content to parse
      if (res.status === 204 || res.status === 205) {
        if (!res.ok)
          throw new ApiError(res.statusText || `HTTP ${res.status}`, res.status);
        return { res, body: undefined };
      }

      const body = await parseBody(res);
      return { res, body };
    } catch (err: any) {
      // Convert AbortError into a typed ApiError for consistent handling
      if (err && err.name === "AbortError") {
        console.error(`[API] Timeout error for ${url}`);
        throw new ApiError("Request timed out", 0, { reason: "timeout", url });
      }
      // Network error or other fetch error
      console.error(`[API] Network error for ${url}:`, err.message);
      throw new ApiError(err?.message || "Network error", 0, err);
    } finally {
      clearTimeout(timer);
    }
  }

  // Core executor that performs the request with refresh handling
  const execute = async (): Promise<T> => {
    // First attempt
    let { res, body } = await runOnce(false);

    // If access expired or invalid token → single-flight refresh → replay once
    if (isAccessExpired(res.status, body) || isInvalidToken(res.status, body)) {
      //console.log('[API] Token expired/invalid, attempting refresh...');
      try {
        await ensureRefresh();
      } catch (err: any) {
        console.error('[API] Refresh failed:', err.message);
        // Surface as 401 to callers
        const message = err?.message || "Session expired";
        throw new ApiError(message, 401, err?.payload ?? body);
      }
      
      //console.log('[API] Retrying original request after refresh...');
      // Pass true to indicate this is a retry
      ({ res, body } = await runOnce(true));
    }

    // Final error handling
    if (!res.ok) {
      const msg =
        (body &&
          typeof body === "object" &&
          "message" in body &&
          (body as any).message) ||
        res.statusText ||
        `HTTP ${res.status}`;
      console.error(`[API] Error response: ${res.status} ${msg}`);
      throw new ApiError(String(msg), res.status, body);
    }

    return body as T;
  };

  // Deduplicate GET requests to the same URL while in-flight
  const method = (init.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const dedupeKey = `${method}:${url}`;

  if (isGet) {
    const existing = pendingGetRequests.get(dedupeKey);
    if (existing) {
      //console.log(`[API] Deduplicating GET request: ${url}`);
      return existing as Promise<T>;
    }
    const p = execute().finally(() => {
      pendingGetRequests.delete(dedupeKey);
    });
    pendingGetRequests.set(dedupeKey, p);
    return p as Promise<T>;
  }

  return execute();
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