import type { Fabric } from '@/services/fabric';
import { formatPrice } from '@/utils/currency';

export function isFabricSellable(fabric: Fabric | null | undefined): boolean {
  if (!fabric?.isSellable) return false;
  if (fabric.yardBundle !== 4 && fabric.yardBundle !== 6) return false;
  const price = Number(fabric.bundlePrice);
  return Number.isFinite(price) && price > 0;
}

export function isFabricOutOfStock(fabric: Fabric | null | undefined): boolean {
  if (!isFabricSellable(fabric) || !fabric) return false;
  if (fabric.inStock === false) return true;
  if (typeof fabric.stockBundles === 'number' && fabric.stockBundles <= 0) {
    return true;
  }
  return false;
}

export function isFabricPurchasable(fabric: Fabric | null | undefined): boolean {
  return isFabricSellable(fabric) && !isFabricOutOfStock(fabric);
}

export function getFabricBundleLabel(fabric: Fabric): string {
  return `${fabric.yardBundle} yards`;
}

export function formatFabricBundlePrice(fabric: Fabric): string {
  if (!fabric.bundlePrice) return '';
  return `${formatPrice(fabric.bundlePrice)} / ${getFabricBundleLabel(fabric)}`;
}

export function getMaxFabricBundles(fabric: Fabric): number {
  if (typeof fabric.stockBundles === 'number' && fabric.stockBundles >= 0) {
    return Math.max(0, fabric.stockBundles);
  }
  return 99;
}
