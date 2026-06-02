import type { CartLine } from '@/store/cartStore';
import { formatPrice } from '@/utils/currency';

export function getCartLineKey(item: Pick<CartLine, 'id' | 'lineType'>): string {
  return `${item.lineType ?? 'product'}:${item.id}`;
}

/** Deduplicate cart lines by line type + id (no accidental merge of fabric vs product). */
export function dedupeCartLines(items: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const item of items) {
    if (!item?.id) continue;
    const key = getCartLineKey(item);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
      continue;
    }

    const mergedQty =
      Math.max(0, Math.floor(existing.quantity || 0)) +
      Math.max(0, Math.floor(item.quantity || 0));

    map.set(key, {
      ...existing,
      ...item,
      quantity: mergedQty,
      // Prefer defined metadata while preserving any earlier value.
      price: item.price ?? existing.price,
      name: item.name ?? existing.name,
      image: item.image ?? existing.image,
      yardBundle: item.yardBundle ?? existing.yardBundle,
      productNote: item.productNote ?? existing.productNote,
      sizeBreakdown: item.sizeBreakdown ?? existing.sizeBreakdown,
      availableSizes: item.availableSizes ?? existing.availableSizes,
    });
  }
  return Array.from(map.values());
}

export function getCartLineSubtotal(item: CartLine): number {
  const price = typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : 0;
  const qty = Math.max(0, Math.floor(item.quantity || 0));
  return price * qty;
}

export function calculateCartSubtotal(items: CartLine[]): number {
  return dedupeCartLines(items).reduce((sum, item) => sum + getCartLineSubtotal(item), 0);
}

export function countCartUnits(items: CartLine[]): number {
  return dedupeCartLines(items).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export function formatCartLineMeta(item: CartLine): string {
  if (item.lineType === 'fabric') {
    const yards = item.yardBundle as number | undefined;
    return yards
      ? `${item.quantity} bundle${item.quantity === 1 ? '' : 's'} (${yards} yd each)`
      : `${item.quantity} bundle${item.quantity === 1 ? '' : 's'}`;
  }
  if (item.productNote) return String(item.productNote);
  return `Qty ${item.quantity}`;
}

export function formatCartLineUnitPrice(item: CartLine): string {
  const price = typeof item.price === 'number' ? item.price : 0;
  if (item.lineType === 'fabric' && item.yardBundle) {
    return `${formatPrice(price)} / ${item.yardBundle} yd bundle`;
  }
  return formatPrice(price);
}
