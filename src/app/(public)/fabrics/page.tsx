'use client';

import { FabricsGallery } from '@/components/Public_C/fabrics_gallery';

export default function FabricsPage() {
  const handleFilterChange = (filter: string) => {
    // You can add analytics or other logic here
    console.log('Filter changed to:', filter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Fabrics <br /> Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our collection of premium fabrics for your custom designs.
            </p>
          </div>
        </div>
      </div>

      {/* Fabrics Gallery */}
      <FabricsGallery
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}

