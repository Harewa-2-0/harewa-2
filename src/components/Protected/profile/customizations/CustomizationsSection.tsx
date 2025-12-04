'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUserCustomizationsQuery } from '@/hooks/useCustomizations';
import { useFabricsQuery } from '@/hooks/useFabrics';
import { PageSpinner } from '../../admin/components/Spinner';
import CustomizationsList from './CustomizationsList';

export default function CustomizationsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch user's customizations
  const { 
    data: customizations = [], 
    isLoading: isLoadingCustomizations, 
    error: customizationsError 
  } = useCurrentUserCustomizationsQuery();

  // Fetch fabrics for lookup
  const { 
    data: fabrics = [], 
    isLoading: isLoadingFabrics 
  } = useFabricsQuery();

  // Filter and sort customizations (latest first)
  const filteredCustomizations = customizations
    .filter(customization => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Search by outfit type
      if (customization.outfit.toLowerCase().includes(searchLower)) return true;
      
      // Search by outfit option
      if (customization.outfitOption?.toLowerCase().includes(searchLower)) return true;
      
      // Search by fabric name (lookup fabric by ID)
      const fabric = fabrics.find(f => f._id === customization.fabricType);
      if (fabric?.name?.toLowerCase().includes(searchLower)) return true;
      if (fabric?.type?.toLowerCase().includes(searchLower)) return true;
      
      // Search by preferred color
      if (customization.preferredColor?.toLowerCase().includes(searchLower)) return true;
      
      // Search by size
      if (customization.size?.toLowerCase().includes(searchLower)) return true;
      
      return false;
    })
    .sort((a, b) => {
      // Sort by createdAt descending (latest first)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const handleCustomizationClick = (customizationId: string) => {
    router.push(`/profile/customizations/${customizationId}`);
  };

  const handleCreateNew = () => {
    router.push('/shop');
  };

  const isLoading = isLoadingCustomizations || isLoadingFabrics;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border">
          <PageSpinner className="h-64" />
        </div>
      </div>
    );
  }

  if (customizationsError) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Customizations</h2>
          <p className="text-gray-500">
            {customizationsError instanceof Error 
              ? customizationsError.message 
              : 'Failed to load your customization requests. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Customizations</h1>
          <p className="text-gray-600">
            {customizations.length === 0 
              ? 'No customization requests yet'
              : `${customizations.length} customization${customizations.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Browse Products
        </button>
      </div>

      {/* Search Bar */}
      {customizations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by outfit, fabric, color, or size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
      )}

      {/* Content */}
      {customizations.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <img
              src="/unauthorized.png"
              alt="No Customizations"
              width={128}
              height={128}
              className=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">No Customizations Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start creating your perfect custom outfit. Browse our products and design something unique just for you.
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Browse Products
          </button>
        </div>
      ) : (
        // Customizations List
        <CustomizationsList
          customizations={filteredCustomizations}
          fabrics={fabrics}
          onCustomizationClick={handleCustomizationClick}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
}
