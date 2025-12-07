// src/services/cart.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";
import { parseProductNote, type SizeBreakdown } from "@/store/cartStore";

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
    product: string | {      // backend uses `product` (id or full object)
      _id?: string;
      id?: string;
      name?: string;
      price?: number;
      images?: string[];
      sizes?: string[];      // available sizes from product
      [key: string]: any;
    };
    quantity: number;
    price?: number;
    productNote?: string;    // size breakdown: "1 medium, 2 small"
    _id?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
} & Record<string, unknown>;

export type CreateCartInput = {
  // Used for adding products to existing cart via POST /api/cart/me
  products: Array<{ productId: string; quantity?: number; price?: number; productNote?: string }>;
} & Record<string, unknown>;

export type UpdateCartInput = {
  id: string;                // cart id to PUT
  products: Array<{ productId: string; quantity: number; price?: number; productNote?: string }>;
};

export type AddToMyCartInput = {
  productId: string;
  quantity?: number;
  price?: number;
  productNote?: string | string[];  // size breakdown: "1 medium, 2 small" or ["1 medium", "2 small"]
} & Record<string, unknown>;

/** ---------- Paths (external cart API) ---------- */
const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/cart`;
const paths = {
  add: `${BASE}/me`,                                  // POST /api/cart/me (add products to user's cart)
  update: (id: string) => `${BASE}/${id}`,            // PUT /api/cart/:id (replace products array)
  delete: (id: string) => `${BASE}/${id}`,            // DELETE /api/cart/:id (delete whole cart)
  byId: (id: string) => `${BASE}/${id}`,              // GET /api/cart/:id
  listMine: `${BASE}/me`,                             // GET /api/cart/me (get user's cart)
  me: `${BASE}/me`,                                   // preferred endpoint for user's cart
  // Endpoints for individual product operations
  addProduct: (cartId: string, productId: string) =>
    `${BASE}/${cartId}/product/${productId}`,         // POST /api/cart/:cartId/product/:productId
  removeProduct: (cartId: string, productId: string) =>
    `${BASE}/${cartId}/product/${productId}`,         // DELETE /api/cart/:cartId/product/:productId
};

/** ---------- Internals ---------- */
function toBackendLine(i: { productId: string; quantity?: number; price?: number; productNote?: string | string[] }) {
  // FIXED: Always send productNote as an array
  let normalizedProductNote: string[] = [];

  if (Array.isArray(i.productNote)) {
    normalizedProductNote = i.productNote;
  } else if (typeof i.productNote === 'string' && i.productNote) {
    // Split comma-separated string into array: "2 small, 3 large" -> ["2 small", "3 large"]
    normalizedProductNote = i.productNote.split(',').map(s => s.trim()).filter(Boolean);
  }

  return {
    product: i.productId,
    quantity: Math.max(1, Math.floor(Number(i.quantity ?? 1))),
    productNote: normalizedProductNote,
  };
}

function toCartArray(data: any): Cart[] {
  // Handle both single cart and { data: [cart] } response formats
  if (Array.isArray(data)) return data as Cart[];
  if (Array.isArray(data?.data)) return data.data as Cart[];
  if (data && (data.products || data._id || data.id)) return [data as Cart];
  // Handle { cart: {...} } format
  if (data?.cart && (data.cart.products || data.cart._id || data.cart.id)) return [data.cart as Cart];
  return [];
}

/** Convert a server Cart into minimal store-friendly items:
 * Store expects: { id, quantity, price?, name?, image?, sizeBreakdown?, productNote?, availableSizes? }
 * This function ensures no duplicates - each product appears only once.
 */
export function mapServerCartToStoreItems(server: Cart) {
  const lines = Array.isArray(server?.products) ? server.products : [];

  // Create a map to ensure no duplicates - keep the latest quantity for each product
  const productMap = new Map<string, {
    id: string;
    quantity: number;
    price?: number;
    name?: string;
    image?: string;
    sizeBreakdown?: SizeBreakdown;
    productNote?: string;
    availableSizes?: string[];
  }>();

  lines.forEach((l) => {
    // Handle both formats: product as string ID or full product object
    let productId: string;
    let productName: string | undefined;
    let productImage: string | undefined;
    let productPrice: number | undefined;
    let availableSizes: string[] | undefined;

    if (typeof l.product === 'string') {
      // Old format: product is just an ID string
      productId = String(l.product);
    } else if (l.product && typeof l.product === 'object') {
      // New format: product is a full object
      productId = String(l.product._id || l.product.id);
      productName = l.product.name;
      productImage = Array.isArray(l.product.images) && l.product.images.length > 0
        ? l.product.images[0]
        : undefined;
      productPrice = typeof l.product.price === 'number' ? l.product.price : undefined;
      availableSizes = Array.isArray(l.product.sizes) ? l.product.sizes : undefined;
    } else {
      // Fallback
      productId = String(l.product);
    }

    const quantity = Number.isFinite(l.quantity as number) ? (l.quantity as number) : 1;
    const price = typeof l.price === "number" ? l.price : productPrice;

    // Filter out invalid products
    if (!productId || productId === 'null' || productId === 'undefined') {
      console.warn('Found invalid product in cart, skipping:', l);
      return;
    }

    // Parse productNote to sizeBreakdown
    const rawProductNote = l.productNote;
    const productNote = Array.isArray(rawProductNote)
      ? rawProductNote.join(", ")
      : (rawProductNote ?? "");

    const sizeBreakdown = productNote ? parseProductNote(productNote) : undefined;

    // Always replace - no merging quantities (idempotent behavior)
    productMap.set(productId, {
      id: productId,
      quantity,
      price,
      name: productName,
      image: productImage,
      sizeBreakdown,
      productNote,
      availableSizes,
    });
  });

  return Array.from(productMap.values());
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

/** Add product to cart using POST /cart/me endpoint */
export async function addToMyCart(item: AddToMyCartInput) {
  try {
    // Use the simple POST /cart/me endpoint - every logged-in user has a cart
    const body = [toBackendLine(item)]; // array per backend contract
    const raw = await api<MaybeWrapped<Cart>>(paths.add, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
      cache: "no-store",
    });
    return unwrap<Cart>(raw);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    throw error;
  }
}

/** Add multiple products to cart using POST /api/cart/me endpoint */
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

/** Create a new empty cart for the current user (after payment) */
export async function createNewEmptyCart(): Promise<Cart | null> {
  try {
    const raw = await api<MaybeWrapped<Cart>>('/api/cart', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]), // Empty products array
      credentials: "include",
      cache: "no-store",
    });
    return unwrap<Cart>(raw);
  } catch (error) {
    console.error("Failed to create new empty cart:", error);
    throw error;
  }
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
    productId: p.product,
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

/** Remove product from cart using proper DELETE endpoint */
export async function removeProductFromCartNew(cartId: string, productId: string) {
  try {
    const raw = await api<MaybeWrapped<Cart>>(paths.removeProduct(cartId, productId), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });

    return unwrap<Cart>(raw);
  } catch (error) {
    console.error("Failed to remove product from cart:", error);
    throw error;
  }
}

/** Remove product from cart using simple approach */
export async function removeProductFromMyCart(productId: string) {
  try {
    // Get current cart
    const cart = await getMyCart();

    if (!cart) {
      throw new Error("No cart found");
    }

    // Use _id if available, otherwise fall back to id
    const cartId = cart._id || cart.id;
    if (!cartId) {
      throw new Error("No cart ID found");
    }

    // Remove product using proper endpoint
    return await removeProductFromCartNew(cartId, productId);
  } catch (error) {
    console.error("Failed to remove product from cart:", error);
    throw error;
  }
}

/** Remove product from cart using cart ID directly (optimistic approach) */
export async function removeProductFromCartById(cartId: string, productId: string) {
  try {
    // Remove product using proper endpoint without fetching cart first
    return await removeProductFromCartNew(cartId, productId);
  } catch (error) {
    console.error("Failed to remove product from cart:", error);
    throw error;
  }
}

/** Update product quantity in cart using simple approach */
export async function updateProductQuantityInMyCart(productId: string, quantity: number) {
  try {
    // Get current cart
    const cart = await getMyCart();

    if (!cart) {
      throw new Error("No cart found");
    }

    // Use _id if available, otherwise fall back to id
    const cartId = cart._id || cart.id;
    if (!cartId) {
      throw new Error("No cart ID found");
    }

    // If quantity is 0, remove the product
    if (quantity <= 0) {
      return await removeProductFromCartNew(cartId, productId);
    }

    // Update quantity by replacing the entire products array
    const updatedProducts = cart.products.map((p: any) =>
      p.product === productId
        ? { ...p, quantity }
        : p
    );

    return await replaceCartProducts(cartId, updatedProducts.map((p: any) => ({
      productId: p.product,
      quantity: p.quantity,
      price: p.price
    })));
  } catch (error) {
    console.error("Failed to update product quantity:", error);
    throw error;
  }
}

/** Update product quantity in cart using cart ID directly (optimistic approach) */
export async function updateProductQuantityInCartById(cartId: string, productId: string, quantity: number) {
  try {
    // If quantity is 0, remove the product
    if (quantity <= 0) {
      return await removeProductFromCartNew(cartId, productId);
    }

    // For quantity updates, we need to get the current cart to build the updated products array
    // But we can optimize this by getting the cart from the store instead of making a new API call
    const cart = await getMyCart();
    if (!cart) {
      throw new Error("No cart found");
    }

    // Update quantity by replacing the entire products array
    const updatedProducts = cart.products.map((p: any) =>
      p.product === productId
        ? { ...p, quantity }
        : p
    );

    return await replaceCartProducts(cartId, updatedProducts.map((p: any) => ({
      productId: p.product,
      quantity: p.quantity,
      price: p.price
    })));
  } catch (error) {
    console.error("Failed to update product quantity:", error);
    throw error;
  }
}

/** Update product quantity in cart using local state (truly optimistic approach) */
export async function updateProductQuantityOptimistic(cartId: string, productId: string, quantity: number, currentItems: any[]) {
  try {
    // If quantity is 0, remove the product
    if (quantity <= 0) {
      return await removeProductFromCartNew(cartId, productId);
    }

    // Build updated products array from local state instead of fetching from server
    const updatedProducts = currentItems
      .filter(item => item.id && item.id !== 'null' && item.id !== 'undefined')
      .map(item => ({
        productId: item.id,
        quantity: item.id === productId ? quantity : item.quantity,
        price: item.price,
        productNote: item.productNote || undefined,  // include size breakdown
      }));

    return await replaceCartProducts(cartId, updatedProducts);
  } catch (error) {
    console.error("Failed to update product quantity:", error);
    throw error;
  }
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

/** ---------- Helpers for hydration/sync ---------- */

// OPTIMIZATION: Request deduplication to prevent multiple simultaneous calls
const pendingRequests = new Map<string, Promise<any>>();

/** Get my most recent/active cart (scoped to current user if possible).
 * Uses /api/cart/me endpoint which requires authentication.
 * Returns null if user is not logged in or cart doesn't exist.
 */
export async function getMyCart(userId?: string) {
  const requestKey = `getMyCart-${userId || "current"}`;

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const requestPromise = performGetMyCart(userId);
  pendingRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    pendingRequests.delete(requestKey);
  }
}

async function performGetMyCart(userId?: string) {
  try {
    const raw = await api<MaybeWrapped<Cart | Cart[] | { data: Cart[] }>>(paths.me, {
      credentials: "include",
      cache: "no-store",
    });
    const data = unwrap<Cart | Cart[] | { data: Cart[] } | any>(raw);
    const list = toCartArray(data);
    const picked = pickActiveCart(list);
    return picked;
  } catch (error: any) {
    // Token expiration handling
    if (
      error?.status === 401 ||
      error?.message?.includes("expired") ||
      error?.message?.includes("jwt expired") ||
      error?.message?.includes("TokenExpiredError")
    ) {
      console.warn("Token expired while fetching cart, attempting refresh...");

      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (refreshResponse.ok) {
          const raw = await api<MaybeWrapped<Cart | Cart[] | { data: Cart[] }>>(paths.me, {
            credentials: "include",
            cache: "no-store",
          });
          const data = unwrap<Cart | Cart[] | { data: Cart[] } | any>(raw);
          const list = toCartArray(data);
          const picked = pickActiveCart(list);
          return picked;
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }

    console.warn("Failed to fetch user cart:", error);
    return null;
  }
}

/** Deduplicate cart items by product ID and merge quantities */
export function deduplicateCartItems<T extends { id: string; quantity: number; price?: number }>(
  items: T[]
): T[] {
  const productMap = new Map<string, T>();

  items.forEach((item) => {
    if (!item || !item.id) return;

    const productId = String(item.id);
    const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
    const price = typeof item.price === "number" ? item.price : undefined;

    if (productMap.has(productId)) {
      const existing = productMap.get(productId)!;
      productMap.set(productId, {
        ...existing,
        quantity: existing.quantity + quantity,
        price: existing.price ?? price,
      });
    } else {
      productMap.set(productId, {
        ...item,
        quantity,
        price,
      });
    }
  });

  return Array.from(productMap.values());
}

export function buildBackendLinesFromStoreItems(
  items: Array<{ id: string; quantity: number; price?: number }>
) {
  return items.map((i) => toBackendLine({ productId: i.id, quantity: i.quantity, price: i.price }));
}
