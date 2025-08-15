"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, useCartTotalItems } from "@/store/cartStore";
import { replaceCartProducts } from "@/services/cart";
import { ensureCartHydrated, bindCartFocusRevalidate } from "@/services/lib/cart-sync";

interface CartUIProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const CartUI = ({ isOpen = true, setIsOpen }: CartUIProps) => {
  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const replaceCart = useCartStore((s) => s.replaceCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalItems = useCartTotalItems();

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemPrice =
        typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;
      return total + itemPrice * item.quantity;
    }, 0);
  }, [items]);

  useEffect(() => {
    ensureCartHydrated({ force: false, enrich: true });
    bindCartFocusRevalidate();
  }, []);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const debounceMap = useRef<Record<string, number | ReturnType<typeof setTimeout>>>({});

  const buildLines = (arr: typeof items) =>
    arr.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
      price: i.price,
    }));

  const sendReplace = (explicit?: typeof items) => {
    if (!cartId) return;
    const current = explicit ?? useCartStore.getState().items;
    const lines = buildLines(current);

    return replaceCartProducts(cartId, lines)
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  const onChangeQty = (id: string, qty: number) => {
    updateQuantity(id, qty);
    if (debounceMap.current[id]) clearTimeout(debounceMap.current[id] as any);
    debounceMap.current[id] = setTimeout(() => sendReplace(), 400);
  };

  const onRemove = (id: string) => {
    const prev = items;
    const next = prev.filter((i) => i.id !== id);
    removeItem(id);
    if (!cartId) return;
    replaceCartProducts(cartId, buildLines(next))
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        replaceCart(prev);
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  const onClearAll = () => {
    const prev = items;
    clearCart();
    if (!cartId) return;
    replaceCartProducts(cartId, [])
      .then(() => useCartStore.getState().setLastSyncedNow?.())
      .catch(() => {
        replaceCart(prev);
        ensureCartHydrated({ force: true, enrich: true });
      });
  };

  useEffect(() => {
    return () => {
      Object.values(debounceMap.current).forEach((v) => {
        if (typeof v !== "number") clearTimeout(v as any);
      });
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-20 md:top-24 z-50">
      <div className="absolute inset-0" style={{ pointerEvents: "none" }} />
      {/* ⬇️ Fixed, viewport-based height so footer stays visible */}
      <div className="bg-white rounded-lg shadow-2xl border max-w-md w-96 h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
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
          <div className="p-3 border-b flex justify-center flex-shrink-0">
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-300 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer shadow-sm"
              aria-label="Clear cart"
              title="Remove all items"
            >
              <Trash2 size={16} className="text-red-600" />
              <span>Clear cart</span>
            </button>
          </div>
        )}

        {/* Cart Items — only this area scrolls */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Your cart is empty.</div>
          ) : (
            items.map((item) => {
              const name = (item as any).name as string | undefined;
              const image = (item as any).image as string | undefined;
              const hasMeta = Boolean(name) && Boolean(image);

              return (
                <div key={item.id} className="p-3 border-b border-gray-100">
                  <div className="flex gap-2.5">
                    {/* Product Image (reduced height) */}
                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={image || "/placeholder.png"}
                        alt={name || "Loading product..."}
                        className={`w-full h-full object-cover ${hasMeta ? "" : "opacity-70"}`}
                      />
                    </div>

                    {/* Product Details (tight) */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-1.5 leading-tight line-clamp-2">
                        {name || "Loading..."}
                      </p>

                      <div className="mb-2">
                        <span className="text-red-500 font-semibold">
                          {typeof item.price === "number" && Number.isFinite(item.price)
                            ? formatPrice(item.price)
                            : "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onChangeQty(item.id, Math.max(0, item.quantity - 1))}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} className="text-gray-600" />
                        </button>

                        <span className="font-medium text-gray-900 min-w-[18px] text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onChangeQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} className="text-gray-600" />
                        </button>

                        {/* per-item remove */}
                        <button
                          onClick={() => onRemove(item.id)}
                          className="ml-auto w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <X size={12} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (always visible) */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
