"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, useCartTotalItems } from "@/store/cartStore";
import { replaceCartProducts } from "@/services/cart";
import { ensureCartHydrated, bindCartFocusRevalidate } from "@/services/lib/cart-sync";
//import { getMyCart } from "@/services/cart";


interface CartUIProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const CartUI = ({ isOpen = true, setIsOpen }: CartUIProps) => {
  // ✅ stable subscriptions
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const replaceCart = useCartStore((s) => s.replaceCart);
  const clearCart = useCartStore((s) => s.clearCart);


  // derived, hydration-safe
  const totalItems = useCartTotalItems();

  // Calculate subtotal from items directly
  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [items]);

  // hydrate once + on focus
  useEffect(() => {
    ensureCartHydrated({ force: false, enrich: true });
    bindCartFocusRevalidate();
  }, []);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  // debounce map must be stable across renders
  const debounceMap = useRef<Record<string, number | ReturnType<typeof setTimeout>>>({});

  // Build backend lines from current store (or explicit snapshot)
  const buildLines = (arr: typeof items) =>
    arr.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
      price: i.price,
    }));

  // Safer replace: reads latest store when called without explicit items, stamps lastSynced
  const sendReplace = (explicit?: typeof items) => {
    if (!cartId) return; // local-only until we know the server cart id
    const current = explicit ?? useCartStore.getState().items;
    const lines = buildLines(current);

    return replaceCartProducts(cartId, lines)
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        // On any error, re-hydrate from server to realign
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  const onChangeQty = (id: string, qty: number) => {
    // Store semantics: qty <= 0 removes the item
    updateQuantity(id, qty); // optimistic
    if (debounceMap.current[id]) clearTimeout(debounceMap.current[id] as any);
    debounceMap.current[id] = setTimeout(() => {
      // When the timeout fires, read latest store to avoid stale closures
      sendReplace();
    }, 400);
  };

  const onRemove = (id: string) => {
    const prev = items; // snapshot for rollback
    const next = prev.filter((i) => i.id !== id);

    removeItem(id); // optimistic

    if (!cartId) return; // local-only removal when we don't yet have a server cart

    replaceCartProducts(cartId, buildLines(next))
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        // rollback local state to match server; then try to hydrate
        replaceCart(prev);
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  const onClearAll = () => {
    const prev = items;
    // wipe local items (but keep cartId if your store’s clearCart preserves it)
    clearCart();

    if (!cartId) return; // nothing to sync yet

    replaceCartProducts(cartId, [])
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        // rollback local items if server failed
        replaceCart(prev);
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  // Clear any pending debounces on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceMap.current).forEach((v) => {
        if (typeof v !== "number") clearTimeout(v as any);
      });
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div className="absolute inset-0" style={{ pointerEvents: "none" }} />
      <div className="bg-white rounded-lg shadow-2xl border max-w-md w-96 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">MY CART</h2>
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-1 rounded-full border border-[#CCCCCC] transition-colors duration-200 group cursor-pointer"
            style={{ outline: "none" }}
            aria-label="Close cart"
          >
            <X size={20} className="text-[#CCCCCC] group-hover:text-white transition-colors duration-200" />
          </button>
          <style jsx>{`
            .group:hover {
              background: #D4AF37;
              border-color: transparent;
            }
          `}</style>
        </div>

        {/* Clear-all row (only when there are items) */}
        {items.length > 0 && (
          <div className="p-3 border-b flex justify-center">
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Clear cart"
              title="Remove all items"
            >
              <Trash2 size={16} />
              <span>Clear cart</span>
            </button>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Your cart is empty.</div>
          ) : (
            items.map((item) => {
              const name = (item as any).name as string | undefined;
              const image = (item as any).image as string | undefined;
              const hasMeta = Boolean(name) && Boolean(image);

              return (
                <div key={item.id} className="p-4 border-b border-gray-100">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={image || "/placeholder.png"}
                        alt={name || "Loading product..."}
                        className={`w-full h-full object-cover ${hasMeta ? "" : "opacity-70"}`}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2 leading-tight">
                        {name || "Loading..."}
                      </p>

                      <div className="mb-3">
                        <span className="text-red-500 font-semibold">
                          {typeof item.price === "number" && Number.isFinite(item.price)
                            ? formatPrice(item.price)
                            : "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onChangeQty(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </button>

                        <span className="font-medium text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onChangeQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </button>

                        {/* per-item remove: X button */}
                        <button
                          onClick={() => onRemove(item.id)}
                          className="ml-auto w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <X size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-bold text-black text-lg">{formatPrice(subtotal)}</span>
            </div>
            <span className="text-sm text-gray-500">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-2">
            <button
              className="w-full py-3 rounded-lg font-medium text-white transition-colors cursor-pointer"
              style={{ background: "#D4AF37" }}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartUI;
