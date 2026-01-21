// src/services/products.ts
import { api, unwrap, type MaybeWrapped, type Json } from "@/utils/api";

/** ---------- Types ---------- */
export type Product = {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: string | number;         // <- API can return either string or number
  quantity: string | number;
  remainingInStock: string | number;
  location: string;
  images: string[];      // <- required array of image URLs
  sizes: string[];       // <- array of available sizes
  gender: 'male' | 'female' | 'unisex';
  category: string | { _id: string; id: string; name: string; description: string; }; // <- can be string or object
  fabricType: string | { _id: string; name: string; type: string; color: string; pattern: string; weight: number; width: number; composition: string; supplier: string; pricePerMeter: number; inStock: boolean; createdAt: string; updatedAt: string; __v: number; } | null;
  seller: string;
  shop: string;
  slug?: string;         // <- optional but useful for links
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  favourite?: boolean;
  [k: string]: Json | undefined;
};

export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMetadata;
};

export type CreateProductInput = Omit<Product, "_id" | "id">;

export type AdminProductInput = {
  name: string;
  description: string;
  price: string;
  quantity: string;
  remainingInStock: string;
  location: string;
  images: string[];
  sizes: string[];
  gender: 'male' | 'female' | 'unisex';
  category: string;
  fabricType: string;
  seller?: string;
  shop?: string;
};

export type UpdateProductInput = Partial<AdminProductInput> & {
  id: string; // or _id, adjust to your backend
};

/** ---------- Endpoints (adjust paths if your API differs) ---------- */
const BASE = "/api/product";
const paths = {
  add: BASE,                                     // POST /api/product
  addBulk: `${BASE}/bulk`,                       // POST /api/product/bulk
  update: (id: string) => `${BASE}/${id}`,       // PUT /api/product/:id
  delete: (id: string) => `${BASE}/${id}`,       // DELETE /api/product/:id
  list: BASE,                                    // GET /api/product?…
  byId: (id: string) => `${BASE}/${id}`,         // GET /api/product/:id
  byShop: (shopId: string) => `${BASE}/shop/${shopId}`,       // GET /api/product/shop/:shopId
  bySeller: (sellerId: string) => `${BASE}/seller/${sellerId}`, // GET /api/product/seller/:sellerId
};

/** ---------- Admin Product Management Endpoints ---------- */
const ADMIN_PATHS = {
  add: BASE,                                     // POST {{host}}product
  update: (id: string) => `${BASE}/${id}`,       // PUT {{host}}product/{{product_Id}}
  delete: (id: string) => `${BASE}/${id}`,       // DELETE {{host}}product/{{product_Id}}
  list: BASE,                                    // GET {{host}}product
  byId: (id: string) => `${BASE}/${id}`,         // GET {{host}}product/{{product_Id}}
};

/** ---------- Helpers ---------- */
const toQS = (params?: Record<string, string | number | boolean | undefined>) =>
  params
    ? `?${new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    )}`
    : "";

// Normalize product id coming from backend
const pid = (p: Pick<Product, "_id" | "id"> | null | undefined) =>
  p ? String((p as any)._id ?? (p as any).id ?? "") : "";

/** ---------- CRUD ---------- */

// Create one
export async function addProduct(payload: CreateProductInput) {
  const raw = await api<MaybeWrapped<Product>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return unwrap<Product>(raw);
}

/** ---------- ADMIN PRODUCT MANAGEMENT ---------- */

// Admin: Create product with full structure
export async function adminAddProduct(payload: AdminProductInput) {
  const raw = await api<MaybeWrapped<Product>>(ADMIN_PATHS.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }, { timeout: 30000 }); // 30 second timeout for product creation

  return unwrap<Product>(raw);
}

// Admin: Update product
export async function adminUpdateProduct(id: string, payload: Partial<AdminProductInput>) {
  const raw = await api<MaybeWrapped<Product>>(ADMIN_PATHS.update(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return unwrap<Product>(raw);
}

// Admin: Delete product
export async function adminDeleteProduct(id: string) {
  const raw = await api<MaybeWrapped<{ deleted: boolean }>>(ADMIN_PATHS.delete(id), {
    method: "DELETE",
    credentials: "include",
  });
  return unwrap<{ deleted: boolean }>(raw);
}

// Admin: Get all products (for admin dashboard) - with pagination support
export async function adminGetProducts(params?: Record<string, string | number | boolean | undefined>): Promise<Product[] | PaginatedResponse<Product>> {
  const url = `${ADMIN_PATHS.list}${toQS(params)}`;

  try {
    const raw = await api<MaybeWrapped<Product[] | PaginatedResponse<Product> | { data: Product[]; page: number; limit: number; total: number; totalPages: number; count: number }>>(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Ensure cookies are sent
      },
      { timeout: 30000 } // 30 second timeout for fetching products
    );
    // Check if it's the backend format with 'data' key (pagination object)
    if (raw && typeof raw === 'object' && 'data' in raw) {
      const payload = (raw as any).data;
      // Check if this payload has the pagination fields + data array
      if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data) && 'total' in payload) {
        return {
          items: payload.data,
          pagination: {
            page: payload.page,
            limit: payload.limit,
            total: payload.total,
            totalPages: payload.totalPages,
            hasMore: payload.page < payload.totalPages,
          }
        } as PaginatedResponse<Product>;
      }
    }

    const data = unwrap<Product[] | PaginatedResponse<Product> | { data: Product[]; page: number; limit: number; total: number; totalPages: number; count: number }>(raw);


    // Check if it's a paginated response with 'items' key (legacy format)
    if (data && typeof data === 'object' && 'items' in data && 'pagination' in data) {
      return data as PaginatedResponse<Product>;
    }

    // Legacy support: return as array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);

    // Check if it's an authentication error
    if (error instanceof Error && (error.message.includes('Token') || error.message.includes('Unauthorized'))) {
      // Return empty array for auth errors - user might not be logged in
      return [];
    }

    // If the main endpoint fails, try to return empty array instead of throwing
    return [];
  }
}

// Admin: Get product by ID
export async function adminGetProductById(id: string) {
  const raw = await api<MaybeWrapped<Product>>(ADMIN_PATHS.byId(id));
  const data = unwrap<Product>(raw);
  return data ?? null;
}

// Create many
export async function addBulkProducts(payload: CreateProductInput[]) {
  const raw = await api<MaybeWrapped<Product[]>>(paths.addBulk, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return unwrap<Product[]>(raw);
}

// Update
export async function updateProduct({ id, ...rest }: UpdateProductInput) {
  const raw = await api<MaybeWrapped<Product>>(paths.update(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
    credentials: "include",
  });
  return unwrap<Product>(raw);
}

// Delete
export async function deleteProduct(id: string) {
  const raw = await api<MaybeWrapped<{ deleted: boolean }>>(paths.delete(id), {
    method: "DELETE",
    credentials: "include",
  });
  return unwrap<{ deleted: boolean }>(raw);
}

/** ---------- Reads ---------- */

// List (supports pagination/filters via params)
export async function getProducts(params?: Record<string, string | number | boolean | undefined>): Promise<Product[] | PaginatedResponse<Product>> {
  const raw = await api<MaybeWrapped<Product[] | PaginatedResponse<Product> | { data: Product[]; page: number; limit: number; total: number; totalPages: number; count: number }>>(
    `${paths.list}${toQS(params)}`
  );
  // Check if it's the backend format with 'data' key (pagination object)
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const payload = (raw as any).data;
    // Check if this payload has the pagination fields + data array
    if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data) && 'total' in payload) {
      return {
        items: payload.data,
        pagination: {
          page: payload.page,
          limit: payload.limit,
          total: payload.total,
          totalPages: payload.totalPages,
          hasMore: payload.page < payload.totalPages,
        }
      } as PaginatedResponse<Product>;
    }
  }

  const data = unwrap<Product[] | PaginatedResponse<Product> | { data: Product[]; page: number; limit: number; total: number; totalPages: number; count: number }>(raw);


  // Check if it's a paginated response with 'items' key (legacy format)
  if (data && typeof data === 'object' && 'items' in data && 'pagination' in data) {
    return data as PaginatedResponse<Product>;
  }

  // Legacy support: return as array
  return Array.isArray(data) ? data : [];
}

export async function getProductById(id: string) {
  const raw = await api<MaybeWrapped<Product>>(paths.byId(id));
  const data = unwrap<Product>(raw);
  return data ?? null;
}

export async function getProductsByShopId(
  shopId: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const raw = await api<MaybeWrapped<Product[] | { items: Product[] }>>(
    `${paths.byShop(shopId)}${toQS(params)}`
  );
  const data = unwrap<Product[] | { items: Product[] }>(raw);
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function getProductsBySellerId(
  sellerId: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const raw = await api<MaybeWrapped<Product[] | { items: Product[] }>>(
    `${paths.bySeller(sellerId)}${toQS(params)}`
  );
  const data = unwrap<Product[] | { items: Product[] }>(raw);
  return Array.isArray(data) ? data : data?.items ?? [];
}

/** ---------- Batch-by-ids (for cart enrichment) ---------- */
/**
 * Standard approach:
 * 1) Try a batch endpoint: GET /api/product?ids=a,b,c
 * 2) Fallback to per-id requests, rate-limited to small chunks
 */
export async function getProductsByIds(ids: string[]) {
  const unique = Array.from(new Set(ids.map(String).filter(Boolean)));
  if (unique.length === 0) return [];

  // 1) Try batch endpoint using existing list route with ?ids=
  try {
    const raw = await api<MaybeWrapped<Product[] | { items: Product[] }>>(
      `${paths.list}${toQS({ ids: unique.join(",") })}`
    );
    const data = unwrap<Product[] | { items: Product[] }>(raw);
    const arr = Array.isArray(data) ? data : data?.items ?? [];
    if (arr.length > 0) {
      const set = new Set(unique);
      // Only keep requested ids and in server order
      const filtered = arr.filter((p) => set.has(pid(p)));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // fall back
  }

  // 2) Fallback: fan-out by id with small concurrency (avoid hammering)
  const out: Product[] = [];
  const CHUNK = 6;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK);
    const settled = await Promise.allSettled(slice.map((id) => getProductById(id)));
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) out.push(r.value);
    }
  }
  return out;
}
