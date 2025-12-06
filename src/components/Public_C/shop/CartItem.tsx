"use client";

import React, { useRef } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSizeInitial, type CartLine } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";
import { SizeSelectorPopover } from "./SizeSelectorPopover";

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
    const name = item.name || 'Product Name';
    const image = item.image || '/placeholder.png';
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    const isPending = pendingOperations.has(item.id);
    const sizeBreakdown = item.sizeBreakdown || {};
    const availableSizes = (item.availableSizes as string[]) || [];
    const activeSizes = Object.entries(sizeBreakdown).filter(([, qty]) => qty > 0);
    const hasMultiSizes = activeSizes.length > 1;
    const showPopoverOnIncrease = availableSizes.length > 1 || hasMultiSizes;

    // Local ref for the quantity button group (anchor for popover)
    const anchorRef = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white"
        >
            <div className="flex gap-4">
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {name}
                    </h3>

                    <div className="mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                                {formatPrice(itemPrice)}
                            </span>
                        </div>
                    </div>

                    <div className="mb-3">
                        {activeSizes.length > 0 ? (
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
                        ) : (
                            <span className="text-xs text-gray-500">
                                Size: {(() => {
                                    if (!item.size) return 'N/A';
                                    const sizeStr = String(item.size);
                                    return getSizeInitial(sizeStr);
                                })()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div
                            className="relative flex items-center gap-2"
                            ref={anchorRef}
                        >
                            <button
                                onClick={() => handleQuantityChange(item.id, 'decrease', hasMultiSizes)}
                                disabled={isPending}
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
                                onClick={() => handleQuantityChange(item.id, 'increase', showPopoverOnIncrease)}
                                disabled={isPending}
                                className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${showPopoverOnIncrease ? 'border-[#D4AF37] border-dashed' : ''
                                    }`}
                                aria-label="Increase quantity"
                                title={showPopoverOnIncrease ? 'Select size to add' : 'Increase quantity'}
                            >
                                <Plus size={14} className="text-gray-600" />
                            </button>

                            <AnimatePresence>
                                {sizePopover?.itemId === item.id && (
                                    <SizeSelectorPopover
                                        isOpen={true}
                                        onClose={() => setSizePopover(null)}
                                        sizeBreakdown={sizeBreakdown}
                                        availableSizes={availableSizes}
                                        onSizeQuantityChange={(size, qty) => onChangeSizeQty(item.id, size, qty)}
                                        anchorRef={anchorRef}
                                        mode={sizePopover.mode}
                                    />
                                )}
                            </AnimatePresence>
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
                </div>
            </div>
        </motion.div>
    );
};
