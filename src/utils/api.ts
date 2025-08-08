// src/utils/api.ts

// Optional: set this in .env.local if your API is on another domain.
// If you call Next.js route handlers (/api/*) in the same app, you can leave it empty.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const DEFAULT_TIMEOUT = 15000;

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

type MaybeWrapped<T> = { success?: boolean; data?: T } | T;

/** tiny fetch wrapper with timeout + cookie auth */
export async function api<T = any>(
  path: string,
  init: RequestInit = {},
  opts: { timeout?: number } = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeout ?? DEFAULT_TIMEOUT);

  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      credentials: 'include', // keep cookies (auth)
      signal: controller.signal,
      ...init,
    });

    const ct = res.headers.get('content-type') || '';
    const body: Json = ct.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = typeof body === 'string' ? body : (body as any)?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

/** SWR/React Query compatible fetcher */
export const fetcher = <T = any>(url: string) => api<T>(url);

/** Helper to normalize {success,data} or bare data */
function unwrap<T>(payload: MaybeWrapped<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
    return ((payload as any).data ?? null) as T;
  }
  return payload as T;
}

/* ---------------------------------- */
/* Products API                        */
/* ---------------------------------- */

export type Product = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number | string;
  // ...extend as needed
};

/** Optional query params: page, limit, q, category, etc. */
export async function fetchProducts(params?: Record<string, string | number | undefined>) {
  const qs = params
    ? `?${new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      )}`
    : '';

  if (process.env.NODE_ENV !== 'production') {
    // light debug in dev
    console.log('GET /api/product' + qs);
  }

  const raw = await api<MaybeWrapped<Product[]>>(`/api/product${qs}`);

  // Normalize a few common shapes safely
  const data = unwrap<Product[] | any>(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.items)) return (data as any).items;

  console.warn('Unexpected products response shape:', data);
  return [] as Product[];
}

export async function fetchProductById(id: string) {
  if (!id) throw new Error('Product ID is required');

  if (process.env.NODE_ENV !== 'production') {
    console.log(`GET /api/product/${id}`);
  }

  const raw = await api<MaybeWrapped<Product>>(`/api/product/${id}`);
  const data = unwrap<Product | any>(raw);

  if (data && (data._id || data.id)) return data;

  console.warn('Unexpected product response shape:', data);
  return null;
}
