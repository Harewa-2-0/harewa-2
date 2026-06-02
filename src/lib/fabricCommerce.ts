/**
 * Fabric bundle commerce (4- or 6-yard packs).
 * Fabrics are sold as fixed bundles only — not customizable and not sold per meter.
 */

import type { IFabric } from "@/lib/models/Fabric";

export const YARD_BUNDLES = [4, 6] as const;
export type YardBundle = (typeof YARD_BUNDLES)[number];

export type FabricLike = Pick<
  IFabric,
  "isSellable" | "inStock" | "yardBundle" | "bundlePrice" | "stockBundles" | "name"
>;

export function isYardBundle(value: unknown): value is YardBundle {
  return value === 4 || value === 6;
}

export function calcFabricLineTotal(bundlePrice: number, bundleQuantity: number): number {
  const price = Number(bundlePrice);
  const qty = Math.floor(Number(bundleQuantity));
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid bundle price");
  }
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("Bundle quantity must be a positive integer");
  }
  return price * qty;
}

export function assertSellableFabric(fabric: FabricLike | null | undefined): void {
  if (!fabric) {
    throw new Error("Fabric not found");
  }
  if (!fabric.isSellable) {
    throw new Error(`"${fabric.name}" is not available for purchase`);
  }
  if (fabric.inStock === false) {
    throw new Error(`"${fabric.name}" is out of stock`);
  }
  if (!isYardBundle(fabric.yardBundle)) {
    throw new Error(`"${fabric.name}" has no valid yard bundle (4 or 6 yards)`);
  }
  const price = Number(fabric.bundlePrice);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`"${fabric.name}" has no valid bundle price`);
  }
}

export function assertFabricStock(
  fabric: FabricLike,
  bundleQuantity: number
): void {
  assertSellableFabric(fabric);
  const qty = Math.floor(Number(bundleQuantity));
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("Bundle quantity must be a positive integer");
  }
  const stock = fabric.stockBundles;
  if (typeof stock === "number" && stock >= 0 && qty > stock) {
    throw new Error(
      `Only ${stock} bundle(s) available for "${fabric.name}" (${fabric.yardBundle} yards each)`
    );
  }
}

export type FabricSellableInput = {
  isSellable?: boolean;
  yardBundle?: number;
  bundlePrice?: number;
  stockBundles?: number;
};

export function validateFabricSellableFields(
  input: FabricSellableInput
): string | null {
  if (!input.isSellable) {
    return null;
  }
  if (!isYardBundle(input.yardBundle)) {
    return "Sellable fabrics must specify yardBundle as 4 or 6";
  }
  const price = Number(input.bundlePrice);
  if (!Number.isFinite(price) || price <= 0) {
    return "Sellable fabrics must have bundlePrice greater than 0";
  }
  if (
    input.stockBundles !== undefined &&
    (!Number.isFinite(Number(input.stockBundles)) || Number(input.stockBundles) < 0)
  ) {
    return "stockBundles must be 0 or greater";
  }
  return null;
}

export function formatFabricBundleLabel(yardBundle: YardBundle, quantity = 1): string {
  const yards = yardBundle * quantity;
  const bundleWord = quantity === 1 ? "bundle" : "bundles";
  return `${quantity} ${bundleWord} (${yards} yards total, ${yardBundle} yd per bundle)`;
}
