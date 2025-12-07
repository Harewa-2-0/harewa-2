'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { type CustomizationResponse } from '@/services/customization';
import { type CustomerInsights } from '@/utils/customerInsights';

interface CustomerHistorySectionProps {
  customizations: CustomizationResponse[];
  insights: CustomerInsights;
  currentCustomizationId: string;
  isLoading?: boolean;
  error?: Error | null;
}

// Format date to relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Get outfit badge
const getOutfitBadge = (outfit: string) => {
  const outfitClasses: Record<string, string> = {
    gown: 'bg-pink-50 text-pink-700 border-pink-200',
    skirt: 'bg-purple-50 text-purple-700 border-purple-200',
    blouse: 'bg-blue-50 text-blue-700 border-blue-200',
    pants: 'bg-gray-50 text-gray-700 border-gray-200',
    sleeve: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  
  const className = outfitClasses[outfit] || 'bg-gray-50 text-gray-700 border-gray-200';
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${className}`}>
      {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
    </span>
  );
};

export default function CustomerHistorySection({
  customizations,
  insights,
  currentCustomizationId,
  isLoading = false,
  error = null,
}: CustomerHistorySectionProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out current customization and sort by date
  const otherCustomizations = customizations
    .filter(c => (c._id || c.id) !== currentCustomizationId)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const recentRequests = otherCustomizations.slice(0, 3);
  const hasMoreRequests = otherCustomizations.length > 3;

  const handleRequestClick = (customizationId: string) => {
    router.push(`/admin/customizations/${customizationId}`);
  };

  const handleViewAll = () => {
    // For now, just expand the section. In the future, could navigate to a dedicated page
    setIsExpanded(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer History</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer History</h3>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Unable to load customer history</span>
        </div>
      </div>
    );
  }

  if (otherCustomizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer History</h3>
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">This is the customer's first request</p>
          <p className="text-gray-500 text-xs mt-1">Provide extra attention for new customers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer History</h3>
        {otherCustomizations.length > 0 && (
          <span className="text-sm text-gray-500">
            {otherCustomizations.length} previous request{otherCustomizations.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Recent Requests */}
      <div className="space-y-3 mb-4">
        {(isExpanded ? otherCustomizations : recentRequests).map((customization) => {
          const customizationId = customization._id || customization.id || '';
          
          return (
            <div
              key={customizationId}
              onClick={() => handleRequestClick(customizationId)}
              className="p-3 border border-gray-200 rounded-lg hover:border-[#D4AF37] hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {customization.outfit && getOutfitBadge(customization.outfit)}
                  <span className="text-sm font-medium text-gray-900">
                    {customization.fabricType || 'Custom Request'}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{formatRelativeTime(customization.createdAt || '')}</span>
                <span className="font-mono">
                  {customizationId.substring(0, 8)}...
                </span>
              </div>
              
              {customization.preferredColor && (
                <div className="mt-1 text-xs text-gray-500">
                  Colors: {customization.preferredColor}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse Button */}
      {hasMoreRequests && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium border-t border-gray-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show All ({otherCustomizations.length})</span>
            </>
          )}
        </button>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Admin Notes</h4>
          <div className="space-y-1">
            {insights.recommendations.slice(0, 2).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-gray-600">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
