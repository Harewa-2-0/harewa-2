import { api, unwrap, type MaybeWrapped, type Json } from "@/utils/api";
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

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
  product: string | null | {  // Product ID, null, or populated product object
    _id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    sizes?: string[];
    [key: string]: any;
  };
  quantity: number;            // Quantity of the product
  productNote?: string[];      // Size breakdown notes (e.g., ["1 extra-large", "4 large"])
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

// Order placement types
export interface OrderPlacementData {
  cartId: string;
  amount: number;
  address: string;
}

export interface OrderPlacementResult {
  success: boolean;
  orderId?: string;
  error?: string;
  errorCode?:
  | 'NO_ADDRESS'
  | 'DUPLICATE_ORDER'
  | 'NOT_AUTHENTICATED'
  | 'NETWORK_ERROR'
  | 'INVALID_CART'
  | 'EMPTY_CART'
  | 'INVALID_AMOUNT'
  | 'UNKNOWN';
  order?: Order;
}

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

// Get all orders (admin) - FIXED
export async function getOrders(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<Order[]>>(
    `${paths.list}${toQS(params)}`
  );
  const orders = unwrap<Order[]>(raw);
  return orders ?? [];
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

// Get current user's orders - FIXED
export async function getMyOrders(params?: Record<string, string | number | boolean | undefined>) {
  const raw = await api<MaybeWrapped<Order[]>>(
    `${paths.myOrders}${toQS(params)}`
  );
  const orders = unwrap<Order[]>(raw);
  return orders ?? [];
}

// Update order status (convenience function)
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  return updateOrder(orderId, { status });
}

/** ---------- Order Placement Functions ---------- */

/**
 * Creates an order using the current cart and user data
 * This runs alongside the existing checkout flow
 */
export async function createOrderFromCart(): Promise<OrderPlacementResult> {
  try {
    const cartStore = useCartStore.getState();
    const authStore = useAuthStore.getState();

    const { items, cartId } = cartStore;
    const { isAuthenticated } = authStore;

    // Validate authentication
    if (!isAuthenticated) {
      throw new Error('NOT_AUTHENTICATED: User must be authenticated to create an order');
    }

    // Validate cart
    if (!cartId) {
      throw new Error('INVALID_CART: No cart found');
    }

    if (items.length === 0) {
      throw new Error('EMPTY_CART: Cart is empty');
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      return total + (itemPrice * item.quantity);
    }, 0);

    if (totalAmount <= 0) {
      throw new Error('INVALID_AMOUNT: Invalid order amount');
    }

    // Fetch profile data directly from API
    let profileData: any = null;
    try {
      const response = await api<any>('/api/auth/me');
      profileData = response.profile;
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }

    // Get default address
    const defaultAddress = profileData?.addresses?.find((addr: any) => addr.isDefault)
      || profileData?.addresses?.[0];

    if (!defaultAddress) {
      throw new Error('NO_ADDRESS: No delivery address found. Please add an address to your profile.');
    }

    const addressString = `${defaultAddress.line1}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.zip}`;

    // Create the order
    const orderPayload: CreateOrderInput = {
      carts: cartId,
      amount: totalAmount,
      address: addressString,
    };

    console.log('Creating order with payload:', orderPayload);

    const order = await createOrder(orderPayload);

    console.log('Order created successfully:', order);

    return {
      success: true,
      orderId: order._id,
      order: order,
    };

  } catch (error) {
    console.error('Failed to create order:', error);
    const message = error instanceof Error ? error.message : String(error ?? '');
    const normalized = message.toLowerCase();
    let errorCode: OrderPlacementResult['errorCode'] = 'UNKNOWN';

    if (normalized.includes('no delivery address') || normalized.includes('no_address')) {
      errorCode = 'NO_ADDRESS';
    } else if (normalized.includes('already exists')) {
      errorCode = 'DUPLICATE_ORDER';
    } else if (normalized.includes('not_authenticated') || normalized.includes('not authenticated')) {
      errorCode = 'NOT_AUTHENTICATED';
    } else if (normalized.includes('failed to fetch') || normalized.includes('network')) {
      errorCode = 'NETWORK_ERROR';
    } else if (normalized.includes('invalid cart')) {
      errorCode = 'INVALID_CART';
    } else if (normalized.includes('empty cart') || normalized.includes('cart is empty')) {
      errorCode = 'EMPTY_CART';
    } else if (normalized.includes('invalid order amount')) {
      errorCode = 'INVALID_AMOUNT';
    }

    return {
      success: false,
      error: message || 'Failed to create order. Please try again.',
      errorCode,
    };
  }
}

/**
 * Gets the current cart data for order creation
 * Note: This is a synchronous helper - cannot fetch profile data
 * Address should be passed explicitly or fetched separately
 */
export function getCartDataForOrder() {
  const cartStore = useCartStore.getState();
  const authStore = useAuthStore.getState();

  const { items, cartId } = cartStore;
  const { isAuthenticated } = authStore;

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    return total + (itemPrice * item.quantity);
  }, 0);

  return {
    cartId: cartId || '',
    totalAmount,
    isAuthenticated,
    itemCount: items.length,
  };
}

/** ---------- Order Status Mapping ---------- */

/**
 * Maps backend order status to frontend categories
 * Note: 'pending' orders are rare (payment initialization failures) and treated as cancelled
 */
export function mapOrderStatusToCategory(status: Order['status']): 'active' | 'completed' | 'cancelled' {
  switch (status) {
    case 'initiated':
    case 'paid':
    case 'shipped':
      return 'active';
    case 'delivered':
      return 'completed';
    case 'pending':
    default:
      return 'cancelled';
  }
}

/**
 * Gets order status display information
 */
export function getOrderStatusInfo(status: Order['status']) {
  switch (status) {
    case 'pending':
      return { label: 'Payment Failed', color: 'bg-red-100 text-red-800' };
    case 'initiated':
      return { label: 'Payment Initiated', color: 'bg-blue-100 text-blue-800' };
    case 'paid':
      return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    case 'shipped':
      return { label: 'Shipped', color: 'bg-purple-100 text-purple-800' };
    case 'delivered':
      return { label: 'Delivered', color: 'bg-green-100 text-green-800' };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
}