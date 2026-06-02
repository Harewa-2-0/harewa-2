import { validateFabricSellableFields, type FabricSellableInput } from "@/lib/fabricCommerce";

export function pickFabricBody(body: Record<string, unknown>) {
  const allowed = [
    "name",
    "image",
    "type",
    "color",
    "pattern",
    "weight",
    "width",
    "composition",
    "supplier",
    "pricePerMeter",
    "inStock",
    "yardBundle",
    "bundlePrice",
    "stockBundles",
    "isSellable",
  ] as const;

  const picked: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      picked[key] = body[key];
    }
  }
  return picked;
}

export function validateFabricPayload(
  body: Record<string, unknown>,
  options?: { requireName?: boolean }
): string | null {
  if (options?.requireName && !body.name) {
    return "Name is required";
  }

  const sellError = validateFabricSellableFields({
    isSellable: Boolean(body.isSellable),
    yardBundle: body.yardBundle as number | undefined,
    bundlePrice: body.bundlePrice as number | undefined,
    stockBundles: body.stockBundles as number | undefined,
  });

  return sellError;
}

export type { FabricSellableInput };
