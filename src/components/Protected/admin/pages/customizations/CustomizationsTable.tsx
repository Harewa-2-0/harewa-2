'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type CustomizationResponse } from '@/services/customization';
import { PageSpinner } from '../../components/Spinner';

interface CustomizationsTableProps {
  search: string;
  loading?: boolean;
  customizations: CustomizationResponse[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Helper to get user name safely
const getUserName = (customization: CustomizationResponse): string => {
  if (!customization.user) return 'Unknown';
  if (typeof customization.user === 'string') return 'User ' + customization.user.substring(0, 8);
  return customization.user.name || customization.user.email || 'Unknown';
};

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

// Get outfit badge color
const getOutfitBadge = (outfit: string) => {
  const outfitClasses: Record<string, string> = {
    gown: 'bg-pink-100 text-pink-800',
    skirt: 'bg-purple-100 text-purple-800',
    blouse: 'bg-blue-100 text-blue-800',
    pants: 'bg-gray-100 text-gray-800',
    sleeve: 'bg-yellow-100 text-yellow-800',
  };
  
  const className = outfitClasses[outfit] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
    </span>
  );
};

export default function CustomizationsTable({ 
  search, 
  loading = false, 
  customizations,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange
}: CustomizationsTableProps) {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [animatingRows, setAnimatingRows] = useState<Set<string>>(new Set());

  const handleRowClick = (customizationId: string) => {
    router.push(`/admin/customizations/${customizationId}`);
  };

  const toggleExpanded = (customizationId: string) => {
    const isCurrentlyExpanded = expandedRows.has(customizationId);
    
    if (isCurrentlyExpanded) {
      // Closing: Start slide up animation
      setAnimatingRows(prev => new Set(prev).add(customizationId));
      
      // After animation duration, remove from expanded and animating
      setTimeout(() => {
        setExpandedRows(new Set<string>());
        setAnimatingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(customizationId);
          return newSet;
        });
      }, 300); // Match animation duration
    } else {
      // Opening: Close all others first, then open this one
      setExpandedRows(new Set<string>());
      setAnimatingRows(new Set<string>());
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setExpandedRows(new Set([customizationId]));
        setAnimatingRows(prev => new Set(prev).add(customizationId));
        
        // Remove from animating after animation completes
        setTimeout(() => {
          setAnimatingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(customizationId);
            return newSet;
          });
        }, 300);
      }, 50);
    }
  };

  // Expandable content component
  const expandableContent = (customization: CustomizationResponse) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Additional Details */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Outfit Option:</span>{' '}
                <span className="text-gray-900 font-medium">
                  {customization.outfitOption || 'N/A'}
                </span>
              </div>
              {customization.productId && (
                <div>
                  <span className="text-gray-600">Product ID:</span>{' '}
                  <span className="text-gray-900 font-medium font-mono text-xs">
                    {customization.productId}
                  </span>
                </div>
              )}
              {customization.user && typeof customization.user === 'object' && customization.user.email && (
                <div>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="text-gray-900 font-medium">
                    {customization.user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {customization.additionalNotes && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Additional Notes</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {customization.additionalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Request ID:</span>{' '}
              <span className="text-gray-900 font-medium font-mono text-xs">
                {customization._id || customization.id || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Created:</span>{' '}
              <span className="text-gray-900 font-medium">
                {customization.createdAt 
                  ? new Date(customization.createdAt).toLocaleString() 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <PageSpinner className="h-64" />
      </div>
    );
  }

  if (customizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <p className="text-gray-500">
            {search.trim() 
              ? 'No customizations found matching your search' 
              : 'No customization requests yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outfit Type
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
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customizations.map((customization) => {
              const customizationId = customization._id || customization.id || '';
              
              return (
                <React.Fragment key={customizationId}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(customizationId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      {customizationId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserName(customization)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customization.outfit ? getOutfitBadge(customization.outfit) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customization.fabricType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customization.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customization.preferredColor || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRelativeTime(customization.createdAt)}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(customizationId);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded-md p-1 hover:border-gray-400 cursor-pointer"
                          title={expandedRows.has(customizationId) ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-200 ${expandedRows.has(customizationId) ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Customization Details */}
                  {(expandedRows.has(customizationId) || animatingRows.has(customizationId)) && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className={`transition-all duration-300 ease-out ${
                          expandedRows.has(customizationId) 
                            ? 'animate-in slide-in-from-top-2 opacity-100' 
                            : 'animate-out slide-out-to-top-2 opacity-0'
                        }`}>
                          {expandableContent(customization)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

