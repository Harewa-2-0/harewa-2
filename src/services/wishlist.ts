// src/services/wishlist.ts
import { api, unwrap, type MaybeWrapped } from "@/utils/api";

/** ---------- Types ---------- */
export type WishlistProduct = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
  [key: string]: any;
};

export type WishlistToggleResponse = {
  message: string;
  wishlist: {
    _id: string;
    user: string;
    products: string[];
  };
  added: boolean;
};

/** ---------- API Endpoints ---------- */
const BASE = "/api/wishlist";

/** Toggle product in wishlist (add if not exists, remove if exists) */
export async function toggleWishlist(productId: string): Promise<WishlistToggleResponse> {
  try {
    const raw = await api<MaybeWrapped<WishlistToggleResponse>>(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      credentials: "include",
      cache: "no-store",
    });
    return unwrap<WishlistToggleResponse>(raw);
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    throw error;
  }
}

/** Get user's wishlist products */
export async function getMyWishlist(): Promise<WishlistProduct[]> {
  try {
    const raw = await api<any>(BASE, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    
    // Backend returns different formats:
    // 1. If wishlist has products: { data: products[] } or products[]
    // 2. If wishlist is empty: { data: wishlistObject } or null
    
    let data = raw;
    
    // Unwrap if needed
    if (raw && typeof raw === 'object' && 'data' in raw) {
      data = raw.data;
    }
    
    // If data is null or undefined, return empty array
    if (!data) {
      console.log('[getMyWishlist] No wishlist data, returning empty array');
      return [];
    }
    
    // If data is already an array of products, return it
    if (Array.isArray(data)) {
      console.log('[getMyWishlist] Wishlist has', data.length, 'products');
      return data as WishlistProduct[];
    }
    
    // If data is a wishlist object with products array, return empty
    // (backend returns wishlist object when empty)
    if (typeof data === 'object' && 'products' in data) {
      console.log('[getMyWishlist] Wishlist object returned (empty)');
      return [];
    }
    
    console.warn('[getMyWishlist] Unexpected wishlist format:', data);
    return [];
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return [];
  }
}
