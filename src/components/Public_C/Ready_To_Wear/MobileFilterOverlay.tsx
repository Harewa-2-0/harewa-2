"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { DEFAULT_PRICE_RANGE } from "./priceFilter";

interface FilterState {
  category: string;
  size: string;
  priceRange: [number, number];
}

interface MobileFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  sizes: string[];
  totalItems: number;
}

const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  sizes,
  totalItems,
}) => {
  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setPendingFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handlePendingChange = (filterType: keyof FilterState, value: any) => {
    setPendingFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResetPrice = () => {
    setPendingFilters((prev) => ({
      ...prev,
      priceRange: DEFAULT_PRICE_RANGE,
    }));
  };

  const handleApply = () => {
    onApply(pendingFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-40 lg:hidden">
      <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black cursor-pointer"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar
            filters={pendingFilters}
            handleFilterChange={handlePendingChange}
            sizes={sizes}
            totalItems={totalItems}
            showPriceResultCount={false}
          />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white space-y-2">
          <button
            type="button"
            onClick={handleResetPrice}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-black hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Reset price
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="w-full px-4 py-3 bg-[#D4AF37] text-white rounded-lg text-sm font-medium hover:bg-[#B8941F] cursor-pointer transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterOverlay;
