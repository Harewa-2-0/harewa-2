import React from 'react';
import FilterDropdown from './FilterDropdown';

interface FilterState {
  category: string;
  style: string;
  size: string;
  fitType: string;
  color: string;
  priceRange: [number, number];
}

interface SidebarProps {
  filters: FilterState;
  handleFilterChange: (filterType: keyof FilterState, value: any) => void;
  styles: string[];
  sizes: string[];
  fitTypes: string[];
  colors: string[];
  totalItems?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  filters, 
  handleFilterChange, 
  styles, 
  sizes, 
  fitTypes, 
  colors,
  totalItems = 0 
}) => (
  <div className="w-full lg:w-64 bg-white p-6 border-r border-gray-200">
    <h3 className="text-2xl font-bold text-black mb-2">{filters.category}</h3>
    <p className="text-base text-gray-400 mb-8">{totalItems} items available</p>
    <FilterDropdown label="Style" value={filters.style} options={styles} onChange={value => handleFilterChange('style', value)} />
    <FilterDropdown label="Size" value={filters.size} options={sizes} onChange={value => handleFilterChange('size', value)} />
    <FilterDropdown label="Fit type" value={filters.fitType} options={fitTypes} onChange={value => handleFilterChange('fitType', value)} />
    <FilterDropdown label="Colour" value={filters.color} options={colors} onChange={value => handleFilterChange('color', value)} />
    <div className="mb-4 mt-8">
      <label className="block text-base font-medium text-gray-600 mb-4">Price range ($ USD 20,000)</label>
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