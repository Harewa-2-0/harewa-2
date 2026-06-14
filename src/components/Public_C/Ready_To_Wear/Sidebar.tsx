import React from 'react';
import FilterDropdown from './FilterDropdown';
import PriceRangeFilter from './PriceRangeFilter';

interface FilterState {
  category: string;
  size: string;
  priceRange: [number, number];
}

interface SidebarProps {
  filters: FilterState;
  handleFilterChange: (filterType: keyof FilterState, value: any) => void;
  sizes: string[];
  totalItems?: number;
  showPriceResultCount?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  handleFilterChange,
  sizes,
  totalItems = 0,
  showPriceResultCount = true,
}) => (
  <div className="w-full lg:w-64 bg-white p-6 border-r border-gray-200 relative z-20">
    <h3 className="text-2xl font-bold text-black mb-2">{filters.category}</h3>
    <p className="text-base text-gray-400 mb-8">{totalItems} items available</p>
    <FilterDropdown label="Size" value={filters.size} options={sizes} onChange={value => handleFilterChange('size', value)} />
    <PriceRangeFilter
      value={filters.priceRange}
      onChange={(range) => handleFilterChange('priceRange', range)}
      resultCount={totalItems}
      showResultCount={showPriceResultCount}
    />
  </div>
);

export default Sidebar;
