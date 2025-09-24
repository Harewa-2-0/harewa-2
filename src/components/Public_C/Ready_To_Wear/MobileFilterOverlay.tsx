import React from "react";
import Sidebar from "./Sidebar";

interface FilterState {
  category: string;
  style: string;
  size: string;
  fitType: string;
  color: string;
  priceRange: [number, number];
}

interface MobileFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: any) => void;
  styles: string[];
  sizes: string[];
  fitTypes: string[];
  colors: string[];
  totalItems: number;
}

const MobileFilterOverlay: React.FC<MobileFilterOverlayProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  styles,
  sizes,
  fitTypes,
  colors,
  totalItems,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 lg:hidden">
      <div className="absolute left-0 top-0 h-full w-80 bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            filters={filters}
            handleFilterChange={onFilterChange}
            styles={styles}
            sizes={sizes}
            fitTypes={fitTypes}
            colors={colors}
            totalItems={totalItems}
          />
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={onClose}
            className="w-12 h-12 bg-[#D4AF37] text-white rounded-full flex items-center justify-center hover:bg-[#B8941F] transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterOverlay;
