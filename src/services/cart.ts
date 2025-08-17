// src/services/cart.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";

/** ---------- Types (frontend) ---------- */
export type CartItem = {
  productId: string;         // frontend uses productId
  quantity: number;
  price?: number;            // unit price at time of add (optional on server)
} & Record<string, unknown>; // allow extras

export type Cart = {
  id?: string;
  _id?: string;
  user?: string;             // backend uses `user`
  products: Array<{
    product: string;         // backend uses `product` (id)
    quantity: number;
    price?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
} & Record<string, unknown>;

export type CreateCartInput = {
  // not used for "my" cart creation; backend infers from auth
  products: Array<{ productId: string; quantity?: number; price?: number }>;
} & Record<string, unknown>;

export type UpdateCartInput = {
  id: string;                // cart id to PUT
  products: Array<{ productId: string; quantity: number; price?: number }>;
};

export type AddToMyCartInput = {
  productId: string;
  quantity?: number;
  price?: number;
} & Record<string, unknown>;

/** ---------- Paths (prefer /me when available) ---------- */
const BASE = "/api/cart";
const paths = {
  add: BASE,                                   // POST /api/cart  (append/create authed user's cart)
  update: (id: string) => `${BASE}/${id}`,     // PUT /api/cart/:id (replace products array)
  delete: (id: string) => `${BASE}/${id}`,     // DELETE /api/cart/:id (delete whole cart)
  byId: (id: string) => `${BASE}/${id}`,       // GET /api/cart/:id
  listMine: BASE,                               // legacy; some backends overload this
  me: `${BASE}/me`,                             // preferred if backend supports it
};

/** ---------- Internals ---------- */
function toBackendLine(i: { productId: string; quantity?: number; price?: number }) {
  return {
    product: i.productId,                      // map to backend key
    quantity: Math.max(1, Math.floor(Number(i.quantity ?? 1))), // ensure number
    price: typeof i.price === "number" ? i.price : undefined,
  };
}

function toCartArray(data: any): Cart[] {
  // Accept: Cart[], { data: Cart[] }, single Cart, or anything else
  if (Array.isArray(data)) return data as Cart[];
  if (Array.isArray(data?.data)) return data.data as Cart[];
  if (data && (data.products || data._id || data.id)) return [data as Cart];
  return [];
}

/** Convert a server Cart into minimal store-friendly items:
 * Store expects: { id, quantity, price? } where `id` is product id.
 */
export function mapServerCartToStoreItems(server: Cart) {
  const lines = Array.isArray(server?.products) ? server.products : [];
  return lines.map((l) => ({
    id: String(l.product),
    quantity: Number.isFinite(l.quantity as number) ? (l.quantity as number) : 1,
    price: typeof l.price === "number" ? l.price : undefined,
  }));
}

function pickActiveCart(list: Cart[] | any): Cart | null {
  const arr: Cart[] = Array.isArray(list) ? list : toCartArray(list);
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => {
    const at = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bt = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bt - at;
  });
  return sorted[0] ?? null;
}

/** ---------- Mutations ---------- */

/** Append or create authed user's cart (POST /api/cart)
 * Backend expects the BODY to be an ARRAY of product lines.
 * Single-line convenience.
 */
export async function addToMyCart(item: AddToMyCartInput) {
  const body = [toBackendLine(item)]; // array per backend contract
  const raw = await api<MaybeWrapped<Cart>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** POST multiple lines at once (recommended on first create) */
export async function addLinesToMyCart(
  items: Array<{ productId: string; quantity?: number; price?: number }>
) {
  const body = items.map(toBackendLine); // array per backend contract
  const raw = await api<MaybeWrapped<Cart>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** Replace entire products array for a cart (PUT /api/cart/:id) */
export async function replaceCartProducts(id: string, products: UpdateCartInput["products"]) {
  const body = products.map(toBackendLine);
  const raw = await api<MaybeWrapped<Cart>>(paths.update(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** Convenience: remove a single product line by productId (GET → filter → PUT). */
export async function removeProductFromCart(cartId: string, productId: string) {
  const cart = await getCartById(cartId);
  const next = (cart.products ?? []).filter((p) => String(p.product) !== String(productId));
  const body = next.map((p) => ({
    product: p.product,
    quantity: p.quantity,
    price: p.price,
  }));
  const raw = await api<MaybeWrapped<Cart>>(paths.update(cartId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** Delete whole cart (rarely needed) */
export async function deleteCart(id: string) {
  const raw = await api<MaybeWrapped<Cart>>(paths.delete(id), {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** ---------- Reads ---------- */

/** Get a cart by id */
export async function getCartById(id: string) {
  const raw = await api<MaybeWrapped<Cart>>(paths.byId(id), {
    credentials: "include",
    cache: "no-store",
  });
  return unwrap<Cart>(raw);
}

/** Get my most recent/active cart (scoped to current user if possible).
 * Tries /api/cart/me → /api/cart?mine=true → falls back to /api/cart (admin)
 * and filters by userId when provided.
 * Pass your logged-in user's id if you have it: getMyCart(userId).
 */
export async function getMyCart(userId?: string) {
  // Try 1: /api/cart/me (preferred)
  try {
    const raw = await api<MaybeWrapped<Cart | Cart[] | { data: Cart[] }>>(paths.me, {
      credentials: "include",
      cache: "no-store",
    });
    const data = unwrap<Cart | Cart[] | { data: Cart[] } | any>(raw);
    const list = toCartArray(data);
    const mine = userId ? list.filter((c) => String(c.user) === String(userId)) : list;
    const picked = pickActiveCart(mine);
    if (picked) return picked;
  } catch {
    // continue
  }

  // Try 2: /api/cart?mine=true
  try {
    const url = `${paths.listMine}?mine=true`;
    const raw = await api<MaybeWrapped<Cart[] | { data: Cart[] }>>(url, {
      credentials: "include",
      cache: "no-store",
    });
    const data = unwrap<Cart[] | { data: Cart[] } | any>(raw);
    const list = toCartArray(data);
    const mine = userId ? list.filter((c) => String(c.user) === String(userId)) : list;
    const picked = pickActiveCart(mine);
    if (picked) return picked;
  } catch {
    // continue
  }

  // Fallback: /api/cart (admin-ish). Only usable if we can filter by userId.
  try {
    const raw = await api<MaybeWrapped<Cart[] | { data: Cart[] }>>(paths.listMine, {
      credentials: "include",
      cache: "no-store",
    });
    const data = unwrap<Cart[] | { data: Cart[] } | any>(raw);
    const list = toCartArray(data);
    const mine = userId ? list.filter((c) => String(c.user) === String(userId)) : [];
    return pickActiveCart(mine);
  } catch {
    return null;
  }
}

/** ---------- Helpers for hydration/sync ---------- */

export function buildBackendLinesFromStoreItems(
  items: Array<{ id: string; quantity: number; price?: number }>
) {
  return items.map((i) =>
    toBackendLine({ productId: i.id, quantity: i.quantity, price: i.price })
  );
}
