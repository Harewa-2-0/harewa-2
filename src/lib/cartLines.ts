/**
 * Polymorphic cart lines: products (RTW) and fabric yard bundles.
 */

import mongoose from "mongoose";
import { Fabric } from "@/lib/models/Fabric";
import { assertFabricStock } from "@/lib/fabricCommerce";

export const CART_LINE_TYPES = ["product", "fabric"] as const;
export type CartLineType = (typeof CART_LINE_TYPES)[number];

export type ProductCartLineInput = {
  lineType?: "product";
  product: string;
  quantity: number;
  productNote?: string[];
};

export type FabricCartLineInput = {
  lineType: "fabric";
  fabric: string;
  quantity: number;
};

export type CartLineInput = ProductCartLineInput | FabricCartLineInput;

export function isFabricLineInput(
  item: CartLineInput
): item is FabricCartLineInput {
  if (item.lineType === "fabric") return true;
  if (item.lineType === "product") return false;
  return "fabric" in item && Boolean((item as FabricCartLineInput).fabric);
}

export function normalizeCartLineInput(item: CartLineInput): CartLineInput {
  if (item.lineType === "fabric" || ("fabric" in item && item.fabric)) {
    return {
      lineType: "fabric",
      fabric: (item as FabricCartLineInput).fabric,
      quantity: (item as FabricCartLineInput).quantity,
    };
  }
  const productItem = item as ProductCartLineInput;
  return {
    lineType: "product",
    product: productItem.product,
    quantity: productItem.quantity,
    productNote: productItem.productNote,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CartDoc = mongoose.Document & {
  lines?: any[];
  products?: any[];
  markModified?: (path: string) => void;
};

/** Copy legacy `products[]` into `lines[]` when lines are empty. */
export function migrateCartToLines(cart: CartDoc): void {
  if (!cart) return;
  const lines = cart.lines ?? [];
  const products = cart.products ?? [];
  if (lines.length > 0 || products.length === 0) return;

  cart.lines = products
    .filter((p) => p?.product)
    .map((p) => ({
      lineType: "product",
      product: p.product,
      quantity: Number(p.quantity) || 1,
      productNote: p.productNote ?? [],
    }));
  cart.markModified?.("lines");
}

/** Keep deprecated `products[]` in sync for older clients (product lines only). */
export function syncLegacyProductsField(cart: CartDoc): void {
  if (!cart) return;
  migrateCartToLines(cart);
  const lines = cart.lines ?? [];
  cart.products = lines
    .filter((l) => l.lineType === "product" && l.product)
    .map((l) => ({
      product: l.product,
      quantity: Number(l.quantity) || 1,
      productNote: l.productNote ?? [],
    }));
  cart.markModified?.("products");
}

export function getCartPopulateOptions() {
  return [
    { path: "lines.product", model: "Product" },
    { path: "lines.fabric", model: "Fabric" },
    { path: "products.product", model: "Product" },
  ];
}

export async function addProductLineToCart(
  cart: CartDoc,
  item: ProductCartLineInput
): Promise<void> {
  migrateCartToLines(cart);
  if (!item.product) return;

  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const lines = cart.lines ?? [];
  cart.lines = lines;

  const existing = lines.find(
    (l) =>
      l.lineType === "product" &&
      l.product?.toString() === String(item.product)
  );

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + quantity;
    if (item.productNote) {
      existing.productNote = item.productNote;
    }
  } else {
    lines.push({
      lineType: "product",
      product: item.product,
      quantity,
      productNote: item.productNote ?? [],
    });
  }

  syncLegacyProductsField(cart);
}

export async function addFabricLineToCart(
  cart: CartDoc,
  item: FabricCartLineInput
): Promise<void> {
  migrateCartToLines(cart);
  if (!item.fabric) {
    throw new Error("Fabric id is required");
  }

  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const fabric = await Fabric.findById(item.fabric).lean();
  assertFabricStock(fabric, quantity);

  const lines = cart.lines ?? [];
  cart.lines = lines;

  const existing = lines.find(
    (l) =>
      l.lineType === "fabric" && l.fabric?.toString() === String(item.fabric)
  );

  const snapshot = {
    bundlePrice: fabric!.bundlePrice,
    yardBundle: fabric!.yardBundle,
  };

  if (existing) {
    const newQty = Number(existing.quantity || 0) + quantity;
    assertFabricStock(fabric, newQty);
    existing.quantity = newQty;
    existing.bundlePrice = snapshot.bundlePrice;
    existing.yardBundle = snapshot.yardBundle;
  } else {
    lines.push({
      lineType: "fabric",
      fabric: item.fabric,
      quantity,
      bundlePrice: snapshot.bundlePrice,
      yardBundle: snapshot.yardBundle,
    });
  }

  syncLegacyProductsField(cart);
}

export async function applyCartLineInputs(
  cart: CartDoc,
  items: CartLineInput[]
): Promise<void> {
  for (const raw of items) {
    const item = normalizeCartLineInput(raw);
    if (isFabricLineInput(item)) {
      await addFabricLineToCart(cart, item);
    } else {
      await addProductLineToCart(cart, item as ProductCartLineInput);
    }
  }
}

export function removeProductLine(cart: CartDoc, productId: string): void {
  migrateCartToLines(cart);
  cart.lines = (cart.lines ?? []).filter(
    (l) =>
      !(l.lineType === "product" && l.product?.toString() === String(productId))
  );
  syncLegacyProductsField(cart);
}

export function removeFabricLine(cart: CartDoc, fabricId: string): void {
  migrateCartToLines(cart);
  cart.lines = (cart.lines ?? []).filter(
    (l) =>
      !(l.lineType === "fabric" && l.fabric?.toString() === String(fabricId))
  );
  syncLegacyProductsField(cart);
}

export function clearAllCartLines(cart: CartDoc): void {
  cart.lines = [];
  cart.products = [];
  cart.markModified?.("lines");
  cart.markModified?.("products");
}
