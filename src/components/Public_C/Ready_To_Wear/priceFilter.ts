export const PRICE_FILTER_MIN = 0;
export const PRICE_FILTER_MAX = 1000;
export const DEFAULT_PRICE_RANGE: [number, number] = [PRICE_FILTER_MIN, PRICE_FILTER_MAX];

export type ShopSortOption = "feature" | "price-low" | "price-high" | "newest";

export function normalizePriceRange(min: number, max: number): [number, number] {
  const lo = Math.min(Math.max(Number.isFinite(min) ? min : PRICE_FILTER_MIN, PRICE_FILTER_MIN), PRICE_FILTER_MAX);
  const hi = Math.min(Math.max(Number.isFinite(max) ? max : PRICE_FILTER_MAX, PRICE_FILTER_MIN), PRICE_FILTER_MAX);
  return lo <= hi ? [lo, hi] : [hi, lo];
}

export function formatPriceLabel(amount: number): string {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function parsePriceInput(value: string): number {
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : PRICE_FILTER_MIN;
}

export function isDefaultPriceRange(range: [number, number]): boolean {
  return range[0] === PRICE_FILTER_MIN && range[1] === PRICE_FILTER_MAX;
}

export function formatPriceChip(range: [number, number]): string {
  return `$${formatPriceLabel(range[0])} – $${formatPriceLabel(range[1])}`;
}

export function mapShopSortToApi(sort: ShopSortOption): string | undefined {
  switch (sort) {
    case "price-low":
      return "price_asc";
    case "price-high":
      return "price_desc";
    case "newest":
      return "newest";
    default:
      return undefined;
  }
}

export function isFabricInPriceRange(bundlePrice: unknown, range: [number, number]): boolean {
  const price = Number(bundlePrice);
  if (!Number.isFinite(price)) return false;
  return price >= range[0] && price <= range[1];
}
