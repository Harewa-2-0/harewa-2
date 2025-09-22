import { api, unwrap, type MaybeWrapped, type Json } from "@/utils/api";

/** ---------- Types ---------- */
export type Order = {
  _id: string;                 // Mongo ObjectId (use this in URL path)
  user: string | {             // User ID (string) or populated user object
    _id: string;               // User ID
    name: string;              // User's name
  };
  carts: Cart | null;          // Cart object or null
  amount: number;              // Order total amount
  status: 'pending' | 'initiated' | 'paid' | 'shipped' | 'delivered';
  walletId: string;            // Wallet ID for payment
  address: string;             // Delivery address
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
  __v: number;                 // Version key
  [k: string]: Json | undefined;
};

export type Cart = {
  _id: string;                 // Cart ID
  user: string;                // User ID
  products: CartProduct[];     // Array of products in cart
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
  __v: number;                 // Version key
};

export type CartProduct = {
  product: string | null;      // Product ID or null
  quantity: number;            // Quantity of the product
  _id: string;                 // Cart product ID
};

export type CreateOrderInput = {
  carts: string;               // Cart ID (one cart per order)
  amount: number;              // Order total amount
  address: string;             // Delivery address
};

export type UpdateOrderInput = Partial<CreateOrderInput> & {
  status?: 'pending' | 'initiated' | 'paid' | 'shipped' | 'delivered';
  // Include only the fields you want to change
};

/** ---------- Endpoints ---------- */
// Using {{host}}order format as specified
const BASE = "/api/order";
const paths = {
  add: BASE,                                 // POST   /order
  update: (orderId: string) => `${BASE}/${orderId}`, // PUT    /order/:orderId
  delete: (orderId: string) => `${BASE}/${orderId}`, // DELETE /order/:orderId
  list: BASE,                                // GET    /order
  byId: (orderId: string) => `${BASE}/${orderId}`,   // GET    /order/:orderId
  myOrders: `${BASE}/me`,                    // GET    /order/me
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

// remove undefined keys so we only send what's present
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/** ---------- CRUD Operations ---------- */

// Create order
export async function createOrder(payload: CreateOrderInput) {
  if (!payload?.carts || !payload.carts.trim()) {
    throw new Error("createOrder: `carts` (cart ID) is required and cannot be empty.");
  }
  if (!payload?.amount || payload.amount <= 0) {
    throw new Error("createOrder: `amount` is required and must be greater than 0.");
  }
  if (!payload?.address || !payload.address.trim()) {
    throw new Error("createOrder: `address` is required and cannot be empty.");
  }

  const body = compact({
    carts: payload.carts.trim(),
    amount: payload.amount,
    address: payload.address.trim(),
  });

  console.log('Sending JSON payload:', body);

  const raw = await api<MaybeWrapped<Order>>(paths.add, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return unwrap<Order>(raw);
}

// Update order by orderId
export async function updateOrder(orderId: string, payload: UpdateOrderInput) {
  if (!orderId || !orderId.trim()) {
    throw new Error("updateOrder: `orderId` is required in the URL path.");
  }
  
  const body = compact({
    carts: payload.carts?.trim(),
    amount: payload.amount,
    address: payload.address?.trim(),
    status: payload.status,
  });

  console.log('Updating order with payload:', body);

  const raw = await api<MaybeWrapped<Order>>(paths.update(orderId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return unwrap<Order>(raw);
}

// Delete order by orderId
export async function deleteOrder(orderId: string) {
  if (!orderId || !orderId.trim()) {
    throw new Error("deleteOrder: `orderId` is required in the URL path.");
  }
  const raw = await api<MaybeWrapped<{ deleted: boolean }>>(paths.delete(orderId), {
    method: "DELETE",
    credentials: "include",
  });
  return unwrap<{ deleted: boolean }>(raw);
}

// Get all orders (admin)
export async function getOrders(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<{ data: Order[] }>>(
    `${paths.list}${toQS(params)}`
  );
  const response = unwrap<{ data: Order[] }>(raw);
  // Handle the nested response structure: response.data.data
  return response?.data ?? [];
}

// Get orders by status (admin) - filters on frontend since API returns all orders
export async function getOrdersByStatus(status: string, params?: Record<string, string | number | boolean | undefined>) {
  const allOrders = await getOrders(params);
  // Filter by status on the frontend
  return allOrders.filter(order => order.status === status);
}

// Get one order by orderId
export async function getOrderById(orderId: string) {
  if (!orderId || !orderId.trim()) {
    throw new Error("getOrderById: `orderId` is required.");
  }
  const raw = await api<MaybeWrapped<Order>>(paths.byId(orderId));
  const data = unwrap<Order>(raw);
  return data ?? null;
}

// Get current user's orders
export async function getMyOrders(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<{ data: Order[] }>>(
    `${paths.myOrders}${toQS(params)}`
  );
  const response = unwrap<{ data: Order[] }>(raw);
  // Handle the nested response structure: response.data.data
  return response?.data ?? [];
}

// Update order status (convenience function)
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  return updateOrder(orderId, { status });
}
