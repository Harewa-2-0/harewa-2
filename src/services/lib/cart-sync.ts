// src/services/lib/cart-sync.ts
"use client";

import { useCartStore } from "@/store/cartStore";
import { getMyCart } from "@/services/cart";
import { getProductsByIds, type Product as ProductMeta } from "@/services/products";
import { useAuthStore } from "@/store/authStore";

let inflight: Promise<void> | null = null;
let focusBound = false;
const MIN_SYNC_INTERVAL_MS = 10_000; // throttle syncs

/** Extract a stable product id (string) from server product meta */
function metaId(p: Partial<ProductMeta> | any): string {
  return String(p?._id ?? p?.id ?? "");
}

/**
 * Merge server cart into local and optionally enrich product meta.
 * - Guests: never call cart API; only enrich local items (if any).
 * - Logged in: prefer /cart/me in getMyCart(); pass userId so we can filter if backend only has /cart.
 */
export async function ensureCartHydrated(opts?: { force?: boolean; enrich?: boolean }) {
  const force = opts?.force ?? false;
  const enrich = opts?.enrich ?? true;

  // Determine auth state (supports user._id or user.id)
  const auth = useAuthStore.getState?.();
  const userId = auth?.user ? String((auth.user as any)._id ?? (auth.user as any).id ?? "") : "";

  // Guests: skip server calls altogether, but still enrich UI meta if requested
  if (!userId) {
    if (enrich) await enrichMissingMeta();
    return;
  }

  const { lastSyncedAt } = useCartStore.getState();
  const tooSoon = !force && lastSyncedAt && Date.now() - lastSyncedAt < MIN_SYNC_INTERVAL_MS;

  if (tooSoon) {
    if (enrich) await enrichMissingMeta();
    return;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const server = await getMyCart(userId); // pass userId so service can scope/filter
      if (server) {
        useCartStore.getState().mergeServerCart(server); // MERGE, don’t replace
      }
      useCartStore.getState().setLastSyncedNow?.();

      if (enrich) {
        await enrichMissingMeta();
      }
    } catch {
      // swallow; keep local state
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Bind a window focus listener (only once) that revalidates the cart. */
export function bindCartFocusRevalidate() {
  if (focusBound) return;
  focusBound = true;
  window.addEventListener("focus", () => {
    ensureCartHydrated({ force: false, enrich: true });
  });
}

/** Fill in missing name/image/slug (and price fallback) using product summaries */
async function enrichMissingMeta() {
  const state = useCartStore.getState();
  const missingIds = state.items
    .filter((i) => !(i as any).name || !(i as any).image)
    .map((i) => i.id);

  if (missingIds.length === 0) return;

  try {
    const uniqueIds = Array.from(new Set(missingIds));
    const metaList = await getProductsByIds(uniqueIds);

    // Build a typed map safely (avoid tuple inference issues)
    const metaMap = new Map<string, ProductMeta>();
    for (const p of metaList as ProductMeta[]) {
      const id = metaId(p);
      if (id) metaMap.set(id, p);
    }

    const enriched = useCartStore.getState().items.map((i) => {
      const m = metaMap.get(i.id) as Partial<ProductMeta> | undefined;
      if (!m) return i;

      const primaryImage =
        (Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : undefined) ||
        (m as any).image ||
        "/placeholder.png";

      return {
        ...i,
        name: m.name ?? (i as any).name,
        image: primaryImage ?? (i as any).image ?? "/placeholder.png",
        slug: (m as any).slug ?? (i as any).slug,
        // if price was missing locally, backfill from meta
        price:
          typeof i.price === "number"
            ? i.price
            : typeof (m as any).price === "number"
            ? ((m as any).price as number)
            : undefined,
      };
    });

    state.replaceCart(enriched);
  } catch {
    // ignore; show placeholders until next refresh
  }
}
