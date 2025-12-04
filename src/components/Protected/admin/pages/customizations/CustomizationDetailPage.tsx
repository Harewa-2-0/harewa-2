'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Shirt, Palette, Ruler, FileText, Package, Trash2, ImageIcon, ArrowLeft } from 'lucide-react';
import { useCustomizationByIdQuery, useUserCustomizationsQuery } from '@/hooks/useCustomizations';
import { PageSpinner } from '../../components/Spinner';
import { useToast } from '@/contexts/toast-context';
import { api } from '@/utils/api';
import { generateCustomerInsights } from '@/utils/customerInsights';
import CustomerStatsCard from './CustomerStatsCard';
import CustomerHistorySection from './CustomerHistorySection';
import { type CustomizationResponse } from '@/services/customization';

interface CustomizationDetailPageProps {
  customizationId: string;
  customerName?: string;
  customerEmail?: string;
}

// Helper to get user name safely (handles non-populated user field)
const getUserName = (customization: CustomizationResponse): string => {
  if (!customization.user) return 'Unknown User';
  if (typeof customization.user === 'string') return `User ${customization.user.substring(0, 8)}...`;
  return customization.user.name || customization.user.email || 'Unknown User';
};

// Helper to get user email safely
const getUserEmail = (customization: CustomizationResponse): string | null => {
  if (!customization.user || typeof customization.user === 'string') return null;
  return customization.user.email || null;
};

// Format date to readable string
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if an image URL is valid (actual URL, not just a placeholder)
const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// Check if reference images array has valid URLs
const hasValidReferenceImages = (images?: string[]): boolean => {
  if (!images || images.length === 0) return false;
  return images.some(img => isValidImageUrl(img));
};

// Get only valid image URLs from array
const getValidImages = (images?: string[]): string[] => {
  if (!images) return [];
  return images.filter(img => isValidImageUrl(img));
};

// Convert size abbreviation to full name
const getFullSizeName = (size?: string): string => {
  if (!size) return 'N/A';
  
  const sizeMap: Record<string, string> = {
    'S': 'Small',
    'M': 'Medium',
    'L': 'Large',
    'XL': 'Extra Large',
    '1X': '1X Large',
    '2X': '2X Large',
    '3X': '3X Large',
    'XS': 'Extra Small',
  };
  
  return sizeMap[size.toUpperCase()] || size;
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

export default function CustomizationDetailPage({ customizationId, customerName, customerEmail }: CustomizationDetailPageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { data: customization, isLoading, error } = useCustomizationByIdQuery(customizationId);

  // Extract user ID for customer history
  const userId = useMemo(() => {
    if (!customization?.user) return null;
    return typeof customization.user === 'string' ? customization.user : customization.user._id;
  }, [customization?.user]);

  // Fetch customer history
  const { 
    data: userCustomizations = [], 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useUserCustomizationsQuery(userId);

  // Generate customer insights
  const customerInsights = useMemo(() => {
    if (userCustomizations.length === 0) return null;
    return generateCustomerInsights(userCustomizations, customization);
  }, [userCustomizations, customization]);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!customizationId) return;
    
    setIsDeleting(true);
    try {
      await api(`/api/customization/${customizationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      addToast('Customization request deleted successfully', 'success');
      router.push('/admin/customizations');
    } catch (error) {
      console.error('Failed to delete customization:', error);
      addToast('Failed to delete customization request', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customization Details</h1>
            <p className="text-gray-600">Loading customization request...</p>
          </div>
        </div>
        <PageSpinner className="h-64" />
      </div>
    );
  }

  if (error || !customization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customization Details</h1>
            <p className="text-gray-600">Error loading customization request</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">
            {error?.message || 'Customization request not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customization Details</h1>
          <p className="text-gray-600">Request ID: {customization._id || customization.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{customerName || getUserName(customization)}</p>
              </div>
              {(customerEmail || getUserEmail(customization)) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{customerEmail || getUserEmail(customization)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-gray-900 font-mono text-sm">
                  {typeof customization.user === 'string' 
                    ? customization.user 
                    : customization.user?._id || 'N/A'}
                </p>
              </div>
            </div>

            {/* Customer Stats Summary */}
            {customerInsights && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {customerInsights.stats.totalRequests} total request{customerInsights.stats.totalRequests !== 1 ? 's' : ''}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customerInsights.stats.customerStatus === 'new' ? 'bg-blue-100 text-blue-800' :
                      customerInsights.stats.customerStatus === 'regular' ? 'bg-green-100 text-green-800' :
                      customerInsights.stats.customerStatus === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {customerInsights.stats.customerStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Loyalty: {customerInsights.stats.loyaltyScore}/100
                  </div>
                </div>
                {customerInsights.patterns.favoriteOutfitType && (
                  <div className="mt-2 text-xs text-gray-600">
                    Usually orders: {customerInsights.patterns.favoriteOutfitType} in {customerInsights.patterns.commonSizes[0] || 'various sizes'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reference Images & Fabric */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Reference Images</h2>
            </div>
            
            {/* No Images Available */}
            {!hasValidReferenceImages(customization.referenceImage) && !isValidImageUrl(customization.fabricImage) && (
              <p className="text-gray-400 text-sm">This request was created before the image feature was added</p>
            )}
            
            {/* Has Images */}
            {(hasValidReferenceImages(customization.referenceImage) || isValidImageUrl(customization.fabricImage)) && (
              <div className="space-y-6">
                {/* Product Reference Images */}
                {hasValidReferenceImages(customization.referenceImage) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Product Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {getValidImages(customization.referenceImage).map((img, index) => (
                        <button 
                          key={index}
                          onClick={() => { setIsImageLoading(true); setLightboxImage(img); }}
                          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-[#D4AF37] transition-colors cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                              Click to enlarge
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fabric Image */}
                {isValidImageUrl(customization.fabricImage) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Selected Fabric</h3>
                    <button 
                      onClick={() => { setIsImageLoading(true); setLightboxImage(customization.fabricImage!); }}
                      className="group cursor-pointer"
                    >
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#D4AF37] transition-colors">
                        <img
                          src={customization.fabricImage}
                          alt="Selected Fabric"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                            Enlarge
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customization Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shirt className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Customization Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Outfit Type</label>
                <div className="mt-1">
                  {customization.outfit ? getOutfitBadge(customization.outfit) : 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Outfit Option</label>
                <p className="text-gray-900 mt-1">{customization.outfitOption || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fabric Type</label>
                <p className="text-gray-900 mt-1">{customization.fabricType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Size</label>
                <p className="text-gray-900 mt-1">{getFullSizeName(customization.size)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Preferred Colors</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{customization.preferredColor || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {customization.additionalNotes && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{customization.additionalNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Customer Stats Card */}
          {customerInsights && (
            <CustomerStatsCard
              stats={customerInsights.stats}
              patterns={customerInsights.patterns}
              onViewAllRequests={() => {
                // Future: Could navigate to a dedicated customer page
                console.log('View all requests for user:', userId);
              }}
            />
          )}

          {/* Customer History */}
          {userId && (
            <CustomerHistorySection
              customizations={userCustomizations}
              insights={customerInsights || { stats: { totalRequests: 0, customerSince: null, lastRequestDate: null, customerStatus: 'new', loyaltyScore: 0 }, patterns: { favoriteOutfitType: null, favoriteFabricType: null, favoriteColors: [], commonSizes: [], averageRequestsPerMonth: 0 }, recommendations: [] }}
              currentCustomizationId={customizationId}
              isLoading={isLoadingHistory}
              error={historyError}
            />
          )}

          {/* Request Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Request Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Request ID</label>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {customization._id || customization.id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(customization.createdAt)}</p>
              </div>
              {customization.updatedAt && customization.updatedAt !== customization.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{formatDate(customization.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Reference */}
          {customization.productId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Product Reference</h2>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product ID</label>
                <p className="text-gray-900 font-mono text-sm break-all">{customization.productId}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {/* <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors">
                Contact Customer
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Mark as Processed
              </button>
            </div>
          </div> */}

          {/* Delete Action */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Customization Request</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this customization request? This will permanently remove:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Customer request details</li>
                <li>All customization specifications</li>
                <li>Request history and notes</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setLightboxImage(null); setIsImageLoading(false); }}
        >
          <div className="relative max-w-lg max-h-[70vh]">
            <button
              onClick={() => { setLightboxImage(null); setIsImageLoading(false); }}
              className="absolute -top-4 -right-4 w-10 h-10 bg-[#D4AF37] hover:bg-[#C4A030] rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Loading Spinner */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onClick={(e) => e.stopPropagation()}
              onLoadStart={() => setIsImageLoading(true)}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
