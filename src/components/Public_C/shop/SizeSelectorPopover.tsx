"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { getSizeInitial, type SizeBreakdown } from "@/store/cartStore";

export interface SizeSelectorPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    sizeBreakdown: SizeBreakdown;
    availableSizes: string[];
    onSizeQuantityChange: (size: string, qty: number) => void;
    anchorRef: React.RefObject<HTMLDivElement | null>;
    mode: 'increase' | 'decrease';
}

const SizeRow = ({
    size,
    currentQty,
    mode,
    onConfirm
}: {
    size: string,
    currentQty: number,
    mode: 'increase' | 'decrease',
    onConfirm: (amount: number) => void
}) => {
    const [amount, setAmount] = useState(1);
    const isNewSize = currentQty === 0;

    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            {/* Left: Size Label */}
            <div className="flex items-center gap-2 min-w-[60px]">
                <span className={`text-sm font-semibold w-6 ${isNewSize ? 'text-gray-400' : 'text-gray-700'}`}>
                    {getSizeInitial(size)}
                </span>
                {isNewSize && mode === 'increase' && (
                    <span className="text-[9px] text-[#B8941F] font-bold uppercase tracking-wider">NEW</span>
                )}
            </div>

            {/* Center: Amount Stepper */}
            <div className="flex items-center bg-gray-50 rounded border border-gray-200 shadow-sm">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount(prev => Math.max(1, prev - 1));
                    }}
                    disabled={amount <= 1}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-l transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronLeft size={12} />
                </button>

                <span className="w-8 text-center text-xs font-semibold text-gray-900 leading-none">
                    {amount}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setAmount(prev => prev + 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-r transition-colors"
                >
                    <ChevronRight size={12} />
                </button>
            </div>

            {/* Right: Action Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onConfirm(amount);
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-all shadow-sm active:scale-95 ${mode === 'increase'
                    ? 'bg-[#D4AF37] hover:bg-[#B8941F] text-white shadow-[#D4AF37]/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                aria-label={mode === 'increase' ? `Add ${amount}` : `Remove ${amount}`}
            >
                {mode === 'increase' ? <Plus size={14} /> : <Minus size={14} />}
            </button>
        </div>
    );
};

export const SizeSelectorPopover: React.FC<SizeSelectorPopoverProps> = ({
    isOpen,
    onClose,
    sizeBreakdown,
    availableSizes,
    onSizeQuantityChange,
    anchorRef,
    mode,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position based on anchor element
    useEffect(() => {
        if (!isOpen || !anchorRef.current) return;

        const updatePosition = () => {
            const anchorRect = anchorRef.current?.getBoundingClientRect();
            const popoverRect = popoverRef.current?.getBoundingClientRect();

            const popoverHeight = popoverRect?.height || 180;
            const popoverWidth = popoverRect?.width || 260;

            if (anchorRect) {
                let left = anchorRect.left;

                // Prevent overflow on right side
                if (typeof window !== 'undefined') {
                    const padding = 16; // Safety margin
                    if (left + popoverWidth > window.innerWidth - padding) {
                        // Align to right edge of screen minus padding
                        left = window.innerWidth - popoverWidth - padding;
                    }
                    // Prevent overflow on left side
                    if (left < padding) {
                        left = padding;
                    }
                }

                setPosition({
                    top: anchorRect.top - popoverHeight - 10,
                    left: left,
                });
            }
        };

        // Initial and periodic updates to handle layout shifts/renders
        updatePosition();
        const timer = setTimeout(updatePosition, 10);
        const timer2 = setTimeout(updatePosition, 50);

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, anchorRef]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    const sizesToShow = mode === 'increase'
        ? availableSizes.length > 0
            ? availableSizes
            : Object.keys(sizeBreakdown).filter(s => sizeBreakdown[s] > 0)
        : Object.keys(sizeBreakdown).filter(s => sizeBreakdown[s] > 0);

    return typeof window !== 'undefined'
        ? createPortal(
            <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-3.5 min-w-[240px] max-w-[90vw]"
                style={{
                    zIndex: 999999,
                    top: position.top,
                    left: position.left,
                }}
            >
                <div className="flex items-center justify-between mb-3.5 px-1">
                    <div className="text-[11px] font-bold text-black uppercase tracking-wide">
                        {mode === 'increase' ? 'Select Size & Quantity' : 'Select Quantity to Remove'}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-800 transition-colors p-1 -mr-2"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {sizesToShow.length > 0 ? (
                        sizesToShow.map((size) => {
                            const currentQty = sizeBreakdown[size] || 0;
                            return (
                                <SizeRow
                                    key={size}
                                    size={size}
                                    currentQty={currentQty}
                                    mode={mode}
                                    onConfirm={(amount) => {
                                        if (mode === 'increase') {
                                            onSizeQuantityChange(size, currentQty + amount);
                                        } else {
                                            onSizeQuantityChange(size, Math.max(0, currentQty - amount));
                                        }
                                        onClose();
                                    }}
                                />
                            );
                        })
                    ) : (
                        <div className="text-sm text-gray-500 py-2 text-center">
                            No sizes available
                        </div>
                    )}
                </div>
            </motion.div>,
            document.body
        )
        : null;
};
