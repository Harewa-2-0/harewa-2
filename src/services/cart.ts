// src/services/cart.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";

// If you want extras, make them unknown so strict fields don't conflict.
type Extras = Record<string, unknown>;

/* ---------- Types ---------- */
export type CartItem = {
  productId: string;
  quantity: number;
  price: number; // unit price at time of add
} & Extras;

export type Cart = {
  id?: string;
  _id?: string;
  userId?: string;
  items: CartItem[];
  subtotal?: number;
  currency?: string;
  isActive?: boolean;
} & Extras;

export type CreateCartInput = {
  userId?: string;
  items?: CartItem[];
} & Extras;

export type UpdateCartInput = Partial<Omit<Cart, "id" | "_id">> & {
  id: string;
};

export type AddToMyCartInput = {
  productId: string;
  quantity?: number;
  price?: number;
} & Extras;

/* ---------- Paths (confirmed) ---------- */
const BASE = "/cart";
const paths = {
  add: BASE,                            // POST /cart
  update: (id: string) => `${BASE}/${id}`, // PUT /cart/:id
  delete: (id: string) => `${BASE}/${id}`, // DELETE /cart/:id
  byId: (id: string) => `${BASE}/${id}`,   // GET /cart/:id
  my: `${BASE}/me`,                        // GET /cart/me
  addToMy: `${BASE}/me`,                   // POST /cart/me
  list: BASE,                              // GET /cart
};

const toQS = (params?: Record<string, string | number | boolean | undefined>) =>
  params
    ? `?${new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      )}`
    : "";

/* ---------- Mutations ---------- */
export async function addCart(payload: CreateCartInput) {
  const raw = await api<MaybeWrapped<Cart>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return unwrap<Cart>(raw);
}

export async function updateCart({ id, ...rest }: UpdateCartInput) {
  const raw = await api<MaybeWrapped<Cart>>(paths.update(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
    credentials: "include",
  });
  return unwrap<Cart>(raw);
}

export async function deleteCart(id: string) {
  const raw = await api<MaybeWrapped<{ deleted: boolean }>>(paths.delete(id), {
    method: "DELETE",
    credentials: "include",
  });
  return unwrap<{ deleted: boolean }>(raw);
}

export async function addToMyCart(item: AddToMyCartInput) {
  const raw = await api<MaybeWrapped<Cart>>(paths.addToMy, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
    credentials: "include",
  });
  return unwrap<Cart>(raw);
}

/* ---------- Reads ---------- */
export async function getCartById(id: string) {
  const raw = await api<MaybeWrapped<Cart>>(paths.byId(id));
  return unwrap<Cart>(raw);
}

export async function getMyCart() {
  const raw = await api<MaybeWrapped<Cart>>(paths.my);
  return unwrap<Cart>(raw);
}

export async function getAllCarts(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<Cart[] | { items: Cart[] }>>(
    `${paths.list}${toQS(params)}`
  );
  const data = unwrap<Cart[] | { items: Cart[] }>(raw);
  return Array.isArray(data) ? data : data?.items ?? [];
}
