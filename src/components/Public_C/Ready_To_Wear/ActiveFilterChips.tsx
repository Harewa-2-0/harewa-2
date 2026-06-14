import React from "react";
import { X } from "lucide-react";
import {
  DEFAULT_PRICE_RANGE,
  formatPriceChip,
  isDefaultPriceRange,
} from "./priceFilter";

interface ActiveFilterChipsProps {
  priceRange: [number, number];
  size?: string;
  onClearPrice: () => void;
  onClearSize?: () => void;
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  priceRange,
  size,
  onClearPrice,
  onClearSize,
}) => {
  const showPrice = !isDefaultPriceRange(priceRange);
  const showSize = Boolean(size);

  if (!showPrice && !showSize) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {showPrice && (
        <button
          type="button"
          onClick={onClearPrice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-black hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label={`Remove price filter ${formatPriceChip(priceRange)}`}
        >
          <span>{formatPriceChip(priceRange)}</span>
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
      {showSize && onClearSize && (
        <button
          type="button"
          onClick={onClearSize}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-black hover:bg-gray-100 cursor-pointer transition-colors"
          aria-label={`Remove size filter ${size}`}
        >
          <span>Size: {size}</span>
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
      {showPrice && showSize && (
        <button
          type="button"
          onClick={() => {
            onClearPrice();
            onClearSize?.();
          }}
          className="text-sm text-[#B8941F] hover:underline cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default ActiveFilterChips;
