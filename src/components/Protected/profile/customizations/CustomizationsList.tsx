'use client';

import { type CustomizationResponse } from '@/services/customization';
import { type Fabric } from '@/services/fabric';
import CustomizationCard from './CustomizationCard';

interface CustomizationsListProps {
  customizations: CustomizationResponse[];
  fabrics: Fabric[];
  onCustomizationClick: (customizationId: string) => void;
  searchTerm: string;
}

// Format date to relative time or date string
const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Get outfit badge with color
const getOutfitBadge = (outfit: string) => {
  const outfitClasses: Record<string, string> = {
    gown: 'bg-pink-100 text-pink-800 border-pink-200',
    skirt: 'bg-purple-100 text-purple-800 border-purple-200',
    blouse: 'bg-blue-100 text-blue-800 border-blue-200',
    pants: 'bg-gray-100 text-gray-800 border-gray-200',
    sleeve: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  
  const className = outfitClasses[outfit] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${className}`}>
      {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
    </span>
  );
};

// Get fabric name from ID
const getFabricName = (fabricId: string, fabrics: Fabric[]): string => {
  const fabric = fabrics.find(f => f._id === fabricId);
  return fabric?.name || 'Unknown Fabric';
};

// Get fabric details for display
const getFabricDetails = (fabricId: string, fabrics: Fabric[]): { name: string; type?: string; color?: string } => {
  const fabric = fabrics.find(f => f._id === fabricId);
  return {
    name: fabric?.name || 'Unknown Fabric',
    type: fabric?.type,
    color: fabric?.color,
  };
};

export default function CustomizationsList({
  customizations,
  fabrics,
  onCustomizationClick,
  searchTerm
}: CustomizationsListProps) {
  
  if (customizations.length === 0 && searchTerm) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">No Results Found</h3>
        <p className="text-gray-500">
          No customizations match your search for "{searchTerm}". Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Cards Layout */}
      <div className="block lg:hidden space-y-4">
        {customizations.map((customization) => (
          <CustomizationCard
            key={customization._id || customization.id}
            customization={customization}
            fabrics={fabrics}
            onClick={() => onCustomizationClick(customization._id || customization.id || '')}
          />
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outfit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fabric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customizations.map((customization) => {
                const fabricDetails = getFabricDetails(customization.fabricType, fabrics);
                
                return (
                  <tr
                    key={customization._id || customization.id}
                    onClick={() => onCustomizationClick(customization._id || customization.id || '')}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getOutfitBadge(customization.outfit)}
                        <div className="text-sm text-gray-900 font-medium">
                          {customization.outfitOption}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {fabricDetails.name}
                      </div>
                      {fabricDetails.type && (
                        <div className="text-xs text-gray-500">
                          {fabricDetails.type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {customization.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customization.preferredColor}
                      </div>
                      {fabricDetails.color && (
                        <div className="text-xs text-gray-500">
                          Fabric: {fabricDetails.color}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(customization.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        Showing {customizations.length} customization{customizations.length === 1 ? '' : 's'}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </div>
  );
}
