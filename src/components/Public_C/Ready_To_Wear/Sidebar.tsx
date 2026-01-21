import React from 'react';
import FilterDropdown from './FilterDropdown';

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
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  handleFilterChange,
  sizes,
  totalItems = 0
}) => (
  <div className="w-full lg:w-64 bg-white p-6 border-r border-gray-200">
    <h3 className="text-2xl font-bold text-black mb-2">{filters.category}</h3>
    <p className="text-base text-gray-400 mb-8">{totalItems} items available</p>
    <FilterDropdown label="Size" value={filters.size} options={sizes} onChange={value => handleFilterChange('size', value)} />
    <div className="mb-4 mt-8">
      <label className="block text-base font-medium text-gray-600 mb-4">
        Price range ($ {filters.priceRange[0].toLocaleString()} - $ {filters.priceRange[1].toLocaleString()})
      </label>
      <div className="flex items-center space-x-2 w-full">
        <input
          type="range"
          min="0"
          max="500000"
          value={filters.priceRange[1]}
          onChange={e => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          style={{ accentColor: '#D4AF37' }}
        />
      </div>
    </div>
    <style jsx>{`
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #D4AF37;
        cursor: pointer;
        box-shadow: 0 0 2px rgba(0,0,0,0.1);
        border: none;
        margin-top: -6px;
      }
      input[type='range']::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #D4AF37;
        cursor: pointer;
        border: none;
      }
      input[type='range']::-ms-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #D4AF37;
        cursor: pointer;
        border: none;
      }
      input[type='range']::-webkit-slider-runnable-track {
        height: 6px;
        background: #e5e7eb;
        border-radius: 6px;
      }
      input[type='range']::-ms-fill-lower {
        background: #e5e7eb;
        border-radius: 6px;
      }
      input[type='range']::-ms-fill-upper {
        background: #e5e7eb;
        border-radius: 6px;
      }
      input[type='range'] {
        outline: none;
      }
    `}</style>
  </div>
);

export default Sidebar; 