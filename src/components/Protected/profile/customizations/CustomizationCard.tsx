'use client';

import { Calendar, Shirt, Palette, Ruler } from 'lucide-react';
import { type CustomizationResponse } from '@/services/customization';
import { type Fabric } from '@/services/fabric';

interface CustomizationCardProps {
  customization: CustomizationResponse;
  fabrics: Fabric[];
  onClick: () => void;
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${className}`}>
      {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
    </span>
  );
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

export default function CustomizationCard({
  customization,
  fabrics,
  onClick
}: CustomizationCardProps) {
  const fabricDetails = getFabricDetails(customization.fabricType, fabrics);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-[#D4AF37]/30 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {getOutfitBadge(customization.outfit)}
          <h3 className="text-lg font-semibold text-gray-900 mt-2">
            {customization.outfitOption}
          </h3>
        </div>
        <div className="flex items-center text-sm text-gray-500 ml-4">
          <Calendar className="w-4 h-4 mr-1" />
          {formatRelativeTime(customization.createdAt)}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fabric */}
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <Shirt className="w-4 h-4 mr-1" />
            Fabric
          </div>
          <div className="text-sm font-medium text-gray-900">
            {fabricDetails.name}
          </div>
          {fabricDetails.type && (
            <div className="text-xs text-gray-500">
              {fabricDetails.type}
            </div>
          )}
        </div>

        {/* Size */}
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <Ruler className="w-4 h-4 mr-1" />
            Size
          </div>
          <div className="text-sm font-medium text-gray-900">
            {customization.size}
          </div>
        </div>

        {/* Preferred Color */}
        <div className="space-y-1 col-span-2">
          <div className="flex items-center text-sm text-gray-500">
            <Palette className="w-4 h-4 mr-1" />
            Preferred Color
          </div>
          <div className="text-sm font-medium text-gray-900">
            {customization.preferredColor}
          </div>
          {fabricDetails.color && (
            <div className="text-xs text-gray-500">
              Fabric Color: {fabricDetails.color}
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes Preview */}
      {customization.additionalNotes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Notes</div>
          <div className="text-sm text-gray-700 line-clamp-2">
            {customization.additionalNotes}
          </div>
        </div>
      )}

      {/* Action Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-[#D4AF37] font-medium">
          Click to view details →
        </div>
      </div>
    </div>
  );
}
