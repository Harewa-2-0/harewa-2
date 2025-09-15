// src/services/product-category.ts
import { api, unwrap, type MaybeWrapped, type Json } from "@/utils/api";

/** ---------- Types ---------- */
export type ProductCategory = {
  _id: string;                 // Mongo ObjectId (use this in URL path)
  id: string;                  // slug (required by backend body)
  name: string;
  description: string;
  image?: string;
  status?: "active" | "inactive";
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: Json | undefined;
};

export type CreateCategoryInput = {
  id: string;                  // slug (required)
  name: string;
  description: string;
};

export type UpdateCategoryInput = {
  id: string;                  // slug (required by backend for edit)
  name: string;
  description: string;
};

/** ---------- Endpoints ---------- */
const BASE = "/api/product-category";
const paths = {
  add: BASE,                                     // POST /api/product-category
  update: (_id: string) => `${BASE}/${_id}`,     // PUT  /api/product-category/:id   (ObjectId)
  delete: (_id: string) => `${BASE}/${_id}`,     // DELETE /api/product-category/:id
  list: BASE,                                    // GET  /api/product-category
  byId: (_id: string) => `${BASE}/${_id}`,       // GET  /api/product-category/:id
  // Optional (only if your backend exposes it):
  bySlug: (slug: string) => `${BASE}/slug/${slug}`,
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

// Robust slugify to ensure non-empty, URL-safe slug
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")                 // split accents
    .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
    .replace(/[^a-z0-9]+/g, "-")       // non-alnum -> hyphen
    .replace(/^-+|-+$/g, "")           // trim hyphens
    .replace(/-{2,}/g, "-")            // collapse
    .slice(0, 64) || "unnamed";        // never empty
}

/** ---------- CRUD Operations ---------- */

// Create category (requires a non-empty slug `id`)
export async function createCategory(payload: CreateCategoryInput) {
  if (!payload?.id || !payload.id.trim()) {
    throw new Error("createCategory: `id` (slug) is required and cannot be empty.");
  }
  const body = {
    id: payload.id.trim(),
    name: payload.name?.trim() ?? "",
    description: payload.description?.trim() ?? "",
  };
  const raw = await api<MaybeWrapped<ProductCategory>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return unwrap<ProductCategory>(raw);
}

// Convenience: create from name (auto-generate slug)
export async function createCategoryFromName(name: string, description = "") {
  const id = slugify(name);
  return createCategory({ id, name, description });
}

// Update category by _id (ObjectId in URL) and require slug in body
export async function updateCategory(_id: string, payload: UpdateCategoryInput) {
  if (!_id || !_id.trim()) {
    throw new Error("updateCategory: `_id` (ObjectId) is required in the URL path.");
  }
  if (!payload?.id || !payload.id.trim()) {
    throw new Error("updateCategory: `id` (slug) is required in the body and cannot be empty.");
  }
  const body = {
    id: payload.id.trim(),
    name: payload.name?.trim() ?? "",
    description: payload.description?.trim() ?? "",
  };
  const raw = await api<MaybeWrapped<ProductCategory>>(paths.update(_id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return unwrap<ProductCategory>(raw);
}

// Delete category by _id
export async function deleteCategory(_id: string) {
  if (!_id || !_id.trim()) {
    throw new Error("deleteCategory: `_id` (ObjectId) is required in the URL path.");
  }
  const raw = await api<MaybeWrapped<{ deleted: boolean }>>(paths.delete(_id), {
    method: "DELETE",
    credentials: "include",
  });
  return unwrap<{ deleted: boolean }>(raw);
}

// Get all categories
export async function getCategories(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<ProductCategory[] | { items: ProductCategory[] }>>(
    `${paths.list}${toQS(params)}`
  );
  const data = unwrap<ProductCategory[] | { items: ProductCategory[] }>(raw);
  return Array.isArray(data) ? data : data?.items ?? [];
}

// Get category by _id
export async function getCategoryById(_id: string) {
  if (!_id || !_id.trim()) {
    throw new Error("getCategoryById: `_id` (ObjectId) is required.");
  }
  const raw = await api<MaybeWrapped<ProductCategory>>(paths.byId(_id));
  const data = unwrap<ProductCategory>(raw);
  return data ?? null;
}

// Optional: Get category by slug if your backend exposes /slug/:slug
export async function getCategoryBySlug(slug: string) {
  const clean = slug?.trim();
  if (!clean) throw new Error("getCategoryBySlug: `slug` is required.");
  const raw = await api<MaybeWrapped<ProductCategory>>(paths.bySlug(clean));
  const data = unwrap<ProductCategory>(raw);
  return data ?? null;
}
