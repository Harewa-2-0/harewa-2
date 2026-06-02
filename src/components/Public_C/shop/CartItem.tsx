"use client";

import React, { useEffect, useRef } from "react";
import { Minus, Plus, Trash2, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSizeInitial, type CartLine } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

export interface CartItemProps {
    item: CartLine;
    pendingOperations: Set<string>;
    handleQuantityChange: (id: string, mode: 'increase' | 'decrease', showPopover?: boolean) => void;
    onChangeSizeQty: (id: string, size: string, qty: number) => void;
    onRemove: (id: string) => void;
    setSizePopover: (state: { itemId: string; mode: 'increase' | 'decrease' } | null) => void;
    sizePopover: { itemId: string; mode: 'increase' | 'decrease' } | null;
}

export const CartItem: React.FC<CartItemProps> = ({
    item,
    pendingOperations,
    handleQuantityChange,
    onChangeSizeQty,
    onRemove,
    setSizePopover,
    sizePopover,
}) => {
    const isFabric = item.lineType === 'fabric';
    const name = item.name || (isFabric ? 'Fabric' : 'Product Name');
    const image = item.image || '/placeholder.png';
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    const pendingKey = `${item.lineType ?? 'product'}:${item.id}`;
    const isPending = pendingOperations.has(pendingKey);
    const yardBundle = item.yardBundle as number | undefined;
    const sizeBreakdown = item.sizeBreakdown || {};
    const availableSizes = (item.availableSizes as string[]) || [];
    const activeSizes = Object.entries(sizeBreakdown).filter(([, qty]) => qty > 0);
    const hasMultiSizes = activeSizes.length > 1;
    const showInlineEditorOnIncrease = availableSizes.length > 1 || hasMultiSizes;

    // Kept as anchor ref for consistent structure; no floating popovers now.
    const anchorRef = useRef<HTMLDivElement>(null);
    const itemRowRef = useRef<HTMLDivElement>(null);
    const editorIsOpen = !isFabric && sizePopover?.itemId === item.id;
    const editorMode = sizePopover?.mode ?? 'increase';
    const editorSizes = editorMode === 'increase'
        ? (availableSizes.length > 0 ? availableSizes : Object.keys(sizeBreakdown))
        : Object.keys(sizeBreakdown).filter((size) => (sizeBreakdown[size] || 0) > 0);
    const [isFocusPulsing, setIsFocusPulsing] = React.useState(false);

    useEffect(() => {
        if (!editorIsOpen || !itemRowRef.current) return;

        // Ensure the active item + expanded editor are fully visible in the drawer viewport.
        const scrollToItem = () => {
            itemRowRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        };

        const raf = requestAnimationFrame(scrollToItem);
        const timer = setTimeout(scrollToItem, 140);
        setIsFocusPulsing(true);
        const pulseTimer = setTimeout(() => setIsFocusPulsing(false), 450);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timer);
            clearTimeout(pulseTimer);
        };
    }, [editorIsOpen]);

    return (
        <motion.div
            key={item.id}
            ref={itemRowRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-white rounded-xl border p-4 transition-all duration-300 ${
                isFocusPulsing
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/25'
                    : 'border-gray-200'
            }`}
        >
            <span
                className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isFabric
                        ? 'bg-[#D4AF37]/15 text-[#B8941F]'
                        : 'bg-gray-100 text-gray-600'
                }`}
            >
                {isFabric ? 'Fabric' : 'Product'}
            </span>
            <div className="flex gap-4">
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 pr-16">
                        {name}
                    </h3>
                    {isFabric ? (
                        <p className="text-xs text-gray-500 mb-2">
                            {formatPrice(itemPrice)} / {yardBundle ?? '—'} yards
                        </p>
                    ) : (
                        <div className="mb-2">
                            <span className="text-sm font-bold text-gray-900">
                                {formatPrice(itemPrice)}
                            </span>
                        </div>
                    )}
                    <div className="mb-3 min-h-[28px]">
                        {!isFabric && activeSizes.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {activeSizes.map(([size, qty]) => (
                                    <div
                                        key={size}
                                        className="inline-flex items-center h-7 rounded-full bg-gray-100 pl-2.5 pr-1 gap-1.5"
                                    >
                                        <span className="text-xs font-semibold text-gray-500">
                                            {getSizeInitial(size)}
                                        </span>
                                        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-sm">
                                            {qty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : !isFabric ? (
                            <span className="text-xs text-gray-500">
                                Size: {(() => {
                                    if (!item.size) return 'N/A';
                                    const sizeStr = String(item.size);
                                    return getSizeInitial(sizeStr);
                                })()}
                            </span>
                        ) : (
                            <span className="text-sm font-bold text-gray-900">
                                {formatPrice(itemPrice * item.quantity)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div
                            className="relative flex items-center gap-2"
                            ref={anchorRef}
                        >
                            <button
                                onClick={() => handleQuantityChange(item.id, 'decrease', hasMultiSizes && !isFabric)}
                                disabled={isPending || (isFabric && item.quantity <= 1)}
                                className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${hasMultiSizes ? 'border-[#D4AF37] border-dashed' : ''
                                    }`}
                                aria-label="Decrease quantity"
                                title={hasMultiSizes ? 'Select size to decrease' : 'Decrease quantity'}
                            >
                                <Minus size={14} className="text-gray-600" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(item.id, 'increase', showInlineEditorOnIncrease && !isFabric)}
                                disabled={isPending}
                                className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${showInlineEditorOnIncrease ? 'border-[#D4AF37] border-dashed' : ''
                                    }`}
                                aria-label="Increase quantity"
                                title={showInlineEditorOnIncrease ? 'Edit sizes' : 'Increase quantity'}
                            >
                                <Plus size={14} className="text-gray-600" />
                            </button>
                        </div>

                        <button
                            onClick={() => onRemove(item.id)}
                            className="w-8 h-8 border border-red-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                            aria-label="Remove item"
                            title="Remove item from cart"
                        >
                            <Trash2 size={14} className="text-red-500" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {editorIsOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -4 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                                        {editorMode === 'increase' ? 'Add by size' : 'Reduce by size'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSizePopover(null)}
                                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                                    >
                                        Done
                                        <ChevronUp size={12} />
                                    </button>
                                </div>
                                <div className="p-2.5 space-y-2">
                                    {editorSizes.length > 0 ? (
                                        editorSizes.map((size) => {
                                            const currentQty = sizeBreakdown[size] || 0;
                                            return (
                                                <div
                                                    key={size}
                                                    className="flex items-center justify-between gap-2 bg-white rounded-md border border-gray-200 px-2.5 py-2"
                                                >
                                                    <span className="text-xs font-semibold text-gray-700 min-w-8">
                                                        {getSizeInitial(size)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 min-w-6 text-center">
                                                            {currentQty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onChangeSizeQty(
                                                                    item.id,
                                                                    size,
                                                                    Math.max(0, currentQty - 1)
                                                                )
                                                            }
                                                            disabled={isPending || currentQty <= 0}
                                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                            aria-label={`Decrease ${size}`}
                                                        >
                                                            <Minus size={12} className="text-gray-600" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onChangeSizeQty(item.id, size, currentQty + 1)
                                                            }
                                                            disabled={isPending}
                                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                            aria-label={`Increase ${size}`}
                                                        >
                                                            <Plus size={12} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-2">
                                            No sizes available
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
