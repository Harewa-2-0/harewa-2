// src/services/products.ts
import { api, unwrap, type MaybeWrapped, type Json } from "@/utils/api";

/** ---------- Types ---------- */
export type Product = {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  [k: string]: Json | undefined;
};

export type CreateProductInput = Omit<Product, "_id" | "id"> & {
  // add required fields from your backend here (e.g. shopId, sellerId, images, etc.)
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  id: string; // or _id, adjust to your backend
};

/** ---------- Endpoints (adjust paths if your API differs) ---------- */
const BASE = "/api/product";
const paths = {
  add: BASE,                            // POST /api/product
  addBulk: `${BASE}/bulk`,              // POST /api/product/bulk
  update: (id: string) => `${BASE}/${id}`, // PUT /api/product/:id
  delete: (id: string) => `${BASE}/${id}`, // DELETE /api/product/:id
  list: BASE,                           // GET /api/product?…
  byId: (id: string) => `${BASE}/${id}`, // GET /api/product/:id
  byShop: (shopId: string) => `${BASE}/shop/${shopId}`,     // GET /api/product/shop/:shopId
  bySeller: (sellerId: string) => `${BASE}/seller/${sellerId}`, // GET /api/product/seller/:sellerId
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
export async function getProducts(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<Product[] | { items: Product[] }>>(
    `${paths.list}${toQS(params)}`
  );
  const data = unwrap<Product[] | { items: Product[] }>(raw);
  return Array.isArray(data) ? data : data?.items ?? [];
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
