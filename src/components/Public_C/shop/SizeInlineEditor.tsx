"use client";

import { Minus, Plus, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSizeInitial, type SizeBreakdown } from "@/store/cartStore";

export interface SizeInlineEditorProps {
    isOpen: boolean;
    sizes: string[];
    sizeBreakdown: SizeBreakdown;
    onIncrease: (size: string) => void;
    onDecrease?: (size: string) => void;
    onClose: () => void;
    isPending?: boolean;
    title?: string;
    /** stacked = cart drawer; compact = shop product cards */
    layout?: "stacked" | "compact";
}

/** Narrow column: tap size to add, −/+ stacked below */
function CompactSizeColumn({
    size,
    qty,
    isPending,
    onIncrease,
    onDecrease,
}: {
    size: string;
    qty: number;
    isPending: boolean;
    onIncrease: () => void;
    onDecrease?: () => void;
}) {
    const initial = getSizeInitial(size);
    const active = qty > 0;

    return (
        <div
            className={`relative flex min-w-0 flex-col items-stretch gap-1 overflow-visible rounded-lg border p-1 ${
                active
                    ? "border-[#D4AF37] bg-[#D4AF37]/5"
                    : "border-gray-200 bg-white"
            }`}
        >
            <button
                type="button"
                onClick={onIncrease}
                disabled={isPending}
                className={`relative flex h-8 w-full items-center justify-center overflow-visible rounded-md text-xs font-bold leading-none transition-colors disabled:opacity-50 cursor-pointer ${
                    active
                        ? "bg-[#D4AF37]/15 text-gray-900 hover:bg-[#D4AF37]/25"
                        : "bg-gray-50 text-gray-800 hover:bg-[#D4AF37]/10"
                }`}
                aria-label={`Add size ${size}`}
            >
                {initial}
                {active && (
                    <span className="pointer-events-none absolute -top-2 -right-2 z-[50] min-w-[18px] h-[18px] px-0.5 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold leading-[18px] text-center ring-2 ring-white shadow-sm">
                        {qty}
                    </span>
                )}
            </button>
            <div className="flex flex-col gap-0.5">
                <button
                    type="button"
                    onClick={() => onDecrease?.()}
                    disabled={isPending || qty <= 0 || !onDecrease}
                    className="flex h-7 w-full items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-35 disabled:hover:bg-gray-100 cursor-pointer"
                    aria-label={`Remove one ${size}`}
                >
                    <Minus size={13} strokeWidth={3} />
                </button>
                <button
                    type="button"
                    onClick={onIncrease}
                    disabled={isPending}
                    className="flex h-7 w-full items-center justify-center rounded-md border border-[#D4AF37]/50 bg-[#D4AF37]/20 text-[#8B6914] hover:bg-[#D4AF37]/35 active:bg-[#D4AF37]/45 disabled:opacity-40 cursor-pointer"
                    aria-label={`Add one ${size}`}
                >
                    <Plus size={13} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}

export function SizeInlineEditor({
    isOpen,
    sizes,
    sizeBreakdown,
    onIncrease,
    onDecrease,
    onClose,
    isPending = false,
    title = "Add by size",
    layout = "stacked",
}: SizeInlineEditorProps) {
    const isCompact = layout === "compact";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border border-gray-200 bg-gray-50 ${
                        isCompact ? "mt-1.5 overflow-visible" : "overflow-hidden"
                    }`}
                >
                    {isCompact ? (
                        <>
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-1.5 py-1.5 sm:px-2.5">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                                    {title}
                                </p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                    Done
                                    <ChevronUp size={12} />
                                </button>
                            </div>
                            <div className="overflow-visible px-1 py-1.5 sm:p-2">
                                {sizes.length > 0 ? (
                                    <div
                                        className="grid gap-1 overflow-visible sm:gap-1.5"
                                        style={{
                                            gridTemplateColumns: `repeat(${sizes.length}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {sizes.map((size) => (
                                            <CompactSizeColumn
                                                key={size}
                                                size={size}
                                                qty={sizeBreakdown[size] || 0}
                                                isPending={isPending}
                                                onIncrease={() => onIncrease(size)}
                                                onDecrease={
                                                    onDecrease
                                                        ? () => onDecrease(size)
                                                        : undefined
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-500 py-1">
                                        No sizes
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                                    {title}
                                </p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-0.5 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                    Done
                                    <ChevronUp size={12} />
                                </button>
                            </div>
                            <div className="p-2.5 space-y-2">
                                {sizes.length > 0 ? (
                                    sizes.map((size) => {
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
                                                    {onDecrease && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onDecrease(size)}
                                                            disabled={isPending || currentQty <= 0}
                                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                            aria-label={`Decrease ${size}`}
                                                        >
                                                            <Minus size={12} className="text-gray-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => onIncrease(size)}
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
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
