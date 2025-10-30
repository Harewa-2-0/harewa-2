import React from "react";

interface HeaderSectionProps {
  category: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ category }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Hidden on mobile */}
        {/* <div className="py-4 hidden md:block">
          <nav className="flex text-sm text-gray-500">
            <span>Home</span>
            <span className="mx-2">›</span>
            <span>Ready to wear</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{category}</span>
          </nav>
        </div> */}

        {/* Page Title */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-2">
            Ready To Wear
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
            Fashion Clothes
          </h2>
          <p className="text-[#5D5D5D] md:text-base max-w-2xl mx-auto">
            Discover vibrant clothes from skilled craftsmen to suit every of your event.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
