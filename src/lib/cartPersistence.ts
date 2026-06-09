import { Cart } from "@/lib/models/Cart";
import {
  applyCartLineInputs,
  migrateCartToLines,
  syncLegacyProductsField,
  type CartLineInput,
} from "@/lib/cartLines";

const MAX_CART_RETRIES = 4;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isVersionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "VersionError" ||
      error.message.includes("No matching document found for id"))
  );
}

export function isTransientMongoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const name = error.name;
  const message = error.message;
  return (
    name === "MongoNetworkError" ||
    name === "MongoPoolClearedError" ||
    name === "MongoServerSelectionError" ||
    message.includes("ETIMEDOUT") ||
    message.includes("ECONNRESET") ||
    message.includes("PoolRequstedRetry")
  );
}

export function isRetryableCartError(error: unknown): boolean {
  return isVersionError(error) || isTransientMongoError(error);
}

/** Best-effort legacy field sync — never blocks cart reads. */
export async function persistLegacyCartSync(
  cart: Awaited<ReturnType<typeof Cart.findById>>
): Promise<void> {
  if (!cart) return;

  migrateCartToLines(cart);
  syncLegacyProductsField(cart);
  if (!cart.isModified()) return;

  for (let attempt = 0; attempt < MAX_CART_RETRIES; attempt++) {
    try {
      await cart.save();
      return;
    } catch (error) {
      if (!isRetryableCartError(error) || attempt === MAX_CART_RETRIES - 1) {
        console.warn("Cart legacy sync save skipped:", error);
        return;
      }
      const fresh = await Cart.findById(cart._id);
      if (!fresh) return;
      migrateCartToLines(fresh);
      syncLegacyProductsField(fresh);
      cart = fresh;
      await sleep(40 * (attempt + 1));
    }
  }
}

/** Apply line inputs with reload + retry to survive concurrent add-to-cart requests. */
export async function addLinesToUserCart(
  userId: string,
  inputs: CartLineInput[]
): Promise<{ cart: Awaited<ReturnType<typeof Cart.findOne>>; created: boolean }> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_CART_RETRIES; attempt++) {
    try {
      let cart = await Cart.findOne({ user: userId }).sort({ createdAt: -1 });
      let created = false;

      if (!cart) {
        cart = new Cart({
          user: userId,
          lines: [],
          products: [],
        });
        created = true;
      }

      await applyCartLineInputs(cart, inputs);
      await cart.save();
      return { cart, created };
    } catch (error) {
      lastError = error;
      if (!isRetryableCartError(error) || attempt === MAX_CART_RETRIES - 1) {
        throw error;
      }
      await sleep(60 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Failed to update cart");
}
