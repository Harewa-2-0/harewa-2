"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DEFAULT_PRICE_RANGE,
  PRICE_FILTER_MAX,
  PRICE_FILTER_MIN,
  formatPriceLabel,
  normalizePriceRange,
  parsePriceInput,
} from "./priceFilter";

interface PriceRangeFilterProps {
  value: [number, number];
  onChange: (range: [number, number]) => void;
  resultCount?: number;
  showResultCount?: boolean;
  defaultExpanded?: boolean;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  value,
  onChange,
  resultCount,
  showResultCount = true,
  defaultExpanded = true,
}) => {
  const [draft, setDraft] = useState<[number, number]>(value);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [minInput, setMinInput] = useState(formatPriceLabel(value[0]));
  const [maxInput, setMaxInput] = useState(formatPriceLabel(value[1]));
  const [focusedField, setFocusedField] = useState<"min" | "max" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value[0], value[1]]);

  useEffect(() => {
    if (focusedField !== "min") setMinInput(formatPriceLabel(draft[0]));
    if (focusedField !== "max") setMaxInput(formatPriceLabel(draft[1]));
  }, [draft, focusedField]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const commit = (next: [number, number], immediate = false) => {
    const normalized = normalizePriceRange(next[0], next[1]);
    setDraft(normalized);
    setFocusedField(null);
    setMinInput(formatPriceLabel(normalized[0]));
    setMaxInput(formatPriceLabel(normalized[1]));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const push = () => onChange(normalized);
    if (immediate) {
      push();
      return;
    }

    debounceRef.current = setTimeout(push, 300);
  };

  const handleInputKeyDown = (
    field: "min" | "max",
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const step = event.shiftKey ? 25 : 10;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const delta = event.key === "ArrowUp" ? step : -step;
      if (field === "min") {
        commit([draft[0] + delta, draft[1]], true);
      } else {
        commit([draft[0], draft[1] + delta], true);
      }
    }
  };

  const [min, max] = draft;
  const span = PRICE_FILTER_MAX - PRICE_FILTER_MIN;
  const minPercent = ((min - PRICE_FILTER_MIN) / span) * 100;
  const maxPercent = ((max - PRICE_FILTER_MIN) / span) * 100;

  return (
    <div className="mb-4 mt-8">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full mb-3 text-left cursor-pointer"
        aria-expanded={expanded}
      >
        <span className="text-base font-semibold text-black">Price</span>
        <span className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            ${formatPriceLabel(min)} – ${formatPriceLabel(max)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-black transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {expanded && (
        <>
          <div className="relative h-8 mb-4 cursor-pointer">
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#D4AF37] rounded-full"
              style={{ left: `${minPercent}%`, width: `${Math.max(maxPercent - minPercent, 0)}%` }}
            />
            <input
              type="range"
              min={PRICE_FILTER_MIN}
              max={PRICE_FILTER_MAX}
              value={min}
              onChange={(e) => commit([Math.min(Number(e.target.value), max), max], true)}
              className="price-range-input absolute inset-0 w-full"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={PRICE_FILTER_MIN}
              max={PRICE_FILTER_MAX}
              value={max}
              onChange={(e) => commit([min, Math.max(Number(e.target.value), min)], true)}
              className="price-range-input absolute inset-0 w-full"
              aria-label="Maximum price"
            />
          </div>

          {showResultCount && typeof resultCount === "number" && (
            <p className="text-sm text-gray-500 mb-3">
              {resultCount} {resultCount === 1 ? "item" : "items"} in this range
            </p>
          )}

          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="block text-xs font-medium text-gray-600 mb-1">From</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minInput}
                  placeholder="Min"
                  onFocus={() => {
                    setFocusedField("min");
                    setMinInput(String(draft[0]));
                  }}
                  onChange={(e) => setMinInput(e.target.value)}
                  onBlur={() => {
                    const nextMin = minInput.trim() === "" ? draft[0] : parsePriceInput(minInput);
                    commit([nextMin, draft[1]], true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                      return;
                    }
                    handleInputKeyDown("min", e);
                  }}
                  className="price-number-input w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  aria-label="Minimum price"
                />
              </div>
            </label>
            <span className="pb-2 text-gray-400" aria-hidden="true">
              –
            </span>
            <label className="flex-1">
              <span className="block text-xs font-medium text-gray-600 mb-1">To</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxInput}
                  placeholder="Max"
                  onFocus={() => {
                    setFocusedField("max");
                    setMaxInput(String(draft[1]));
                  }}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onBlur={() => {
                    const nextMax = maxInput.trim() === "" ? draft[1] : parsePriceInput(maxInput);
                    commit([draft[0], nextMax], true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                      return;
                    }
                    handleInputKeyDown("max", e);
                  }}
                  className="price-number-input w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  aria-label="Maximum price"
                />
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={() => commit(DEFAULT_PRICE_RANGE, true)}
            className="mt-3 text-sm text-[#B8941F] hover:underline cursor-pointer"
          >
            Reset to ${formatPriceLabel(PRICE_FILTER_MIN)} – ${formatPriceLabel(PRICE_FILTER_MAX)}
          </button>
        </>
      )}

      <style jsx>{`
        .price-range-input {
          appearance: none;
          background: transparent;
          pointer-events: none;
          height: 2rem;
          margin: 0;
          cursor: pointer;
        }
        .price-range-input::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
          cursor: pointer;
        }
        .price-range-input::-moz-range-track {
          height: 6px;
          background: transparent;
          cursor: pointer;
        }
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          margin-top: -7px;
        }
        .price-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #d4af37;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
        .price-number-input::-webkit-outer-spin-button,
        .price-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .price-number-input {
          -moz-appearance: textfield;
        }
        @media (max-width: 1023px) {
          .price-range-input::-webkit-slider-thumb,
          .price-range-input::-moz-range-thumb {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default PriceRangeFilter;
