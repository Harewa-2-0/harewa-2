/**
 * Flatten cart lines for admin/order UI (products + fabric bundles).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CartShape = { lines?: any[]; products?: any[] } | null | undefined;

export type OrderDisplayLine = {
  key: string;
  kind: "product" | "fabric";
  name: string;
  imageUrl?: string;
  quantity: number;
  unitLabel: string;
  unitPrice: number;
  lineTotal: number;
  productNote?: string[];
  yardBundle?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function productFromLine(line: any) {
  return typeof line.product === "object" ? line.product : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fabricFromLine(line: any) {
  return typeof line.fabric === "object" ? line.fabric : null;
}

export function getOrderDisplayLines(cart: CartShape): OrderDisplayLine[] {
  if (!cart) return [];

  const lines =
    Array.isArray(cart.lines) && cart.lines.length > 0
      ? cart.lines
      : (cart.products ?? []).map((p) => ({
          lineType: "product",
          ...p,
        }));

  return lines.map((line, index) => {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));

    if (line.lineType === "fabric") {
      const fabric = fabricFromLine(line);
      const bundlePrice = Number(line.bundlePrice ?? fabric?.bundlePrice ?? 0);
      const yardBundle = Number(line.yardBundle ?? fabric?.yardBundle ?? 0);
      return {
        key: line._id ?? `fabric-${index}`,
        kind: "fabric" as const,
        name: fabric?.name ?? "Fabric",
        imageUrl: typeof fabric?.image === "string" ? fabric.image : undefined,
        quantity: qty,
        unitLabel: `${yardBundle} yd bundle`,
        unitPrice: bundlePrice,
        lineTotal: bundlePrice * qty,
        yardBundle,
      };
    }

    const product = productFromLine(line);
    const price = Number(product?.price ?? 0);
    return {
      key: line._id ?? `product-${index}`,
      kind: "product" as const,
      name: product?.name ?? "Product",
      imageUrl:
        Array.isArray(product?.images) && product.images.length > 0
          ? product.images[0]
          : undefined,
      quantity: qty,
      unitLabel: "unit",
      unitPrice: price,
      lineTotal: price * qty,
      productNote: line.productNote,
    };
  });
}
