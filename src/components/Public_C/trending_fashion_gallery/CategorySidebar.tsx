'use client';

import React from 'react';
import { Category } from './types';

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading?: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  isLoading = false,
}) => {
  return (
    <div className="lg:w-1/3 flex flex-col gap-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-2">
          Trending Fashion Styles
        </h2>
        <img src="/stroke.png" alt="underline" className="h-3" />
      </div>

      {/* Categories */}
      <div className="overflow-x-auto lg:overflow-visible">
        {isLoading ? (
          <div className="flex gap-3 lg:flex-col lg:items-start whitespace-nowrap">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-8 bg-gray-200 rounded-full animate-pulse w-32"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 lg:flex-col lg:items-start whitespace-nowrap">
            {categories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() => onCategoryChange(category.name)}
                className={`text-sm cursor-pointer font-medium rounded-full transition-all duration-300 px-4 py-2
                  ${
                    activeCategory === category.name
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                      : 'text-[#5D5D5D] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
