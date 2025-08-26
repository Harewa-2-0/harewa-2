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

export type ProductDetails = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  gender?: string;
  category?: string;
  style?: string;
  fitType?: string;
  color?: string;
};

export type EnrichedCartItem = {
  id: string;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  gender?: string;
  category?: string;
  style?: string;
  fitType?: string;
  color?: string;
};

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

/** ---------- Paths (updated to use external cart API) ---------- */
const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/cart`;
const paths = {
  add: `${BASE}/me`,                                   // POST /api/cart/me (append/create authed user's cart)
  update: (id: string) => `${BASE}/${id}`,     // PUT /api/cart/:id (replace products array)
  delete: (id: string) => `${BASE}/${id}`,     // DELETE /api/cart/:id (delete whole cart)
  byId: (id: string) => `${BASE}/${id}`,       // GET /api/cart/:id
  listMine: `${BASE}/me`,                               // GET /api/cart/me (get user's cart)
  me: `${BASE}/me`,                             // preferred endpoint for user's cart
  // New endpoints for individual product operations
  addProduct: (cartId: string, productId: string) => `${BASE}/${cartId}/product/${productId}`, // POST /api/cart/:cartId/product/:productId
  removeProduct: (cartId: string, productId: string) => `${BASE}/${cartId}/product/${productId}`, // DELETE /api/cart/:cartId/product/:productId
};

/** ---------- Product Service Paths ---------- */
const PRODUCT_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/product`;

/** ---------- Internals ---------- */
function toBackendLine(i: { productId: string; quantity?: number; price?: number }) {
  return {
    product: i.productId,                      // map to backend key
    quantity: Math.max(1, Math.floor(Number(i.quantity ?? 1))), // ensure number
    price: typeof i.price === "number" ? i.price : undefined,
  };
}

function toCartArray(data: any): Cart[] {
  // Handle both single cart and { data: [cart] } response formats
  if (Array.isArray(data)) return data as Cart[];
  if (Array.isArray(data?.data)) return data.data as Cart[];
  if (data && (data.products || data._id || data.id)) return [data as Cart];
  return [];
}

/** Convert a server Cart into minimal store-friendly items:
 * Store expects: { id, quantity, price? } where `id` is product id.
 * This function deduplicates items by product ID and merges quantities.
 */
export function mapServerCartToStoreItems(server: Cart) {
  const lines = Array.isArray(server?.products) ? server.products : [];
  
  // Create a map to deduplicate by product ID and merge quantities
  const productMap = new Map<string, { id: string; quantity: number; price?: number }>();
  
  lines.forEach((l) => {
    const productId = String(l.product);
    const quantity = Number.isFinite(l.quantity as number) ? (l.quantity as number) : 1;
    const price = typeof l.price === "number" ? l.price : undefined;
    
    if (productMap.has(productId)) {
      // Product already exists - merge quantities
      const existing = productMap.get(productId)!;
      productMap.set(productId, {
        ...existing,
        quantity: existing.quantity + quantity,
        // Keep the first price encountered, or use the new one if existing is undefined
        price: existing.price ?? price,
      });
    } else {
      // New product - add to map
      productMap.set(productId, {
        id: productId,
        quantity,
        price,
      });
    }
  });
  
  // Convert map back to array
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

/** ---------- Product Enrichment ---------- */

/** Fetch product details by ID */
async function fetchProductDetails(productId: string): Promise<ProductDetails | null> {
  try {
    const response = await fetch(`${PRODUCT_BASE}/${productId}`);
    if (!response.ok) {
      console.warn(`Failed to fetch product ${productId}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    // Handle different response formats
    if (data.success && data.data) {
      return data.data;
    } else if (data._id) {
      return data;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching product ${productId}:`, error);
    return null;
  }
}

/** Enrich cart items with product details */
export async function enrichCartItems(cartItems: Array<{ id: string; quantity: number; price?: number }>): Promise<EnrichedCartItem[]> {
  // First, deduplicate items to ensure unique product IDs
  const deduplicatedItems = deduplicateCartItems(cartItems);
  
  // Fetch product details for each cart item
  const productPromises = deduplicatedItems.map(async (item) => {
    const productDetails = await fetchProductDetails(item.id);
    
    if (productDetails) {
      return {
        ...item,
        name: productDetails.name,
        image: productDetails.images?.[0] || '/placeholder.png',
        description: productDetails.description,
        rating: productDetails.rating,
        reviews: productDetails.reviews,
        sizes: productDetails.sizes,
        gender: productDetails.gender,
        category: productDetails.category,
        style: productDetails.style,
        fitType: productDetails.fitType,
        color: productDetails.color,
        // Use product price if cart price is not available
        price: item.price ?? productDetails.price,
      };
    } else {
      // Return item without enrichment if product fetch fails
      return {
        ...item,
        name: 'Product not found',
        image: '/placeholder.png',
      };
    }
  });
  
  // Wait for all product details to be fetched
  const results = await Promise.all(productPromises);
  
  // Return enriched items (already deduplicated)
  return results;
}

/** ---------- Mutations ---------- */

/** Smart add to cart with proper deduplication:
 * 1. Fetch current cart if not in memory
 * 2. Coalesce products by product ID (merge duplicates)
 * 3. PUT full coalesced array to server
 * 4. Return updated cart from server response
 */
export async function addToMyCart(item: AddToMyCartInput) {
  try {
    // First, get the current cart
    const currentCart = await getMyCart();
    
    if (currentCart && currentCart.id) {
      // Cart exists - use new endpoint to add/update product
      const cartId = currentCart.id;
      const productId = item.productId;
      
      // POST to add/update product quantity
      const response = await fetch(paths.addProduct(cartId, productId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: item.quantity || 1,
          price: item.price
        }),
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add product to cart: ${response.status}`);
      }
      
      // Return updated cart
      return await getMyCart();
    } else {
      // No cart exists - create new one
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
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
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

/** Remove product from cart using new DELETE endpoint */
export async function removeProductFromCartNew(cartId: string, productId: string) {
  try {
    const response = await fetch(paths.removeProduct(cartId, productId), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove product from cart: ${response.status}`);
    }
    
    // Return updated cart
    return await getMyCart();
  } catch (error) {
    console.error('Failed to remove product from cart:', error);
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

/** Get my most recent/active cart (scoped to current user if possible).
 * Uses /api/cart/me endpoint which requires authentication.
 * Returns null if user is not logged in or cart doesn't exist.
 */
export async function getMyCart(userId?: string) {
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
    // Check if it's a token expiration error from the backend
    if (error.status === 401 || 
        error.message?.includes('expired') || 
        error.message?.includes('jwt expired') ||
        error.message?.includes('TokenExpiredError')) {
      
      console.warn("Token expired while fetching cart, attempting refresh...");
      
      try {
        // Attempt to refresh the token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (refreshResponse.ok) {
          // Token refreshed, try the cart request again
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
    
    // Return null if user is not authenticated or cart doesn't exist
    console.warn("Failed to fetch user cart:", error);
    return null;
  }
}

/** ---------- Helpers for hydration/sync ---------- */

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
      // Product already exists - merge quantities
      const existing = productMap.get(productId)!;
      productMap.set(productId, {
        ...existing,
        quantity: existing.quantity + quantity,
        // Keep the first price encountered, or use the new one if existing is undefined
        price: existing.price ?? price,
      });
    } else {
      // New product - add to map
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
  return items.map((i) =>
    toBackendLine({ productId: i.id, quantity: i.quantity, price: i.price })
  );
}
