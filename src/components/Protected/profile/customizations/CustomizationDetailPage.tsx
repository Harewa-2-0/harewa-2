'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Calendar, Shirt, Palette, Ruler, FileText, ArrowLeft, ImageIcon } from 'lucide-react';
import { useCustomizationByIdQuery } from '@/hooks/useCustomizations';
import { useFabricsQuery } from '@/hooks/useFabrics';
import { useToast } from '@/contexts/toast-context';
import { PageSpinner } from '../../admin/components/Spinner';
import EditCustomizationForm from './EditCustomizationForm';

interface CustomizationDetailPageProps {
  customizationId: string;
}

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

export default function CustomizationDetailPage({ customizationId }: CustomizationDetailPageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Fetch customization data
  const { 
    data: customization, 
    isLoading: isLoadingCustomization, 
    error: customizationError 
  } = useCustomizationByIdQuery(customizationId);

  // Fetch fabrics for lookup
  const { 
    data: fabrics = [], 
    isLoading: isLoadingFabrics 
  } = useFabricsQuery();

  const isLoading = isLoadingCustomization || isLoadingFabrics;

  // Get fabric details
  const fabric = fabrics.find(f => f._id === customization?.fabricType);

  const handleBack = () => {
    router.push('/profile?tab=customizations');
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    addToast('Customization updated successfully!', 'success');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border">
          <PageSpinner className="h-64" />
        </div>
      </div>
    );
  }

  if (customizationError || !customization) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Customization</h2>
          <p className="text-gray-500 mb-4">
            {customizationError instanceof Error 
              ? customizationError.message 
              : 'Customization not found or failed to load.'}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditCustomizationForm
        customization={customization}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center w-10 h-10 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Update Request
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getOutfitBadge(customization.outfit)}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(customization.createdAt)}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customization.outfitOption}
              </h1>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="p-6 space-y-8">
          {/* Outfit Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shirt className="w-5 h-5" />
              Outfit Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outfit Type
                </label>
                <div className="text-sm text-gray-900">
                  {customization.outfit.charAt(0).toUpperCase() + customization.outfit.slice(1)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style Option
                </label>
                <div className="text-sm text-gray-900">
                  {customization.outfitOption}
                </div>
              </div>
            </div>
          </div>

          {/* Fabric & Color */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Fabric & Color
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric
                </label>
                <div className="text-sm text-gray-900 font-medium">
                  {fabric?.name || 'Unknown Fabric'}
                </div>
                {fabric?.type && (
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {fabric.type}
                  </div>
                )}
                {fabric?.color && (
                  <div className="text-xs text-gray-500">
                    Fabric Color: {fabric.color}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Color
                </label>
                <div className="text-sm text-gray-900">
                  {customization.preferredColor}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Reference Images
            </h2>
            
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Selected Fabric</label>
                    <button 
                      onClick={() => { setIsImageLoading(true); setLightboxImage(customization.fabricImage!); }}
                      className="group cursor-pointer"
                    >
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#D4AF37] transition-colors">
                        <img
                          src={customization.fabricImage}
                          alt="Selected Fabric"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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

          {/* Size & Notes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Size & Notes
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {getFullSizeName(customization.size)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Additional Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {customization.additionalNotes || 'No additional notes provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Fabric Details (if available) */}
          {fabric && (fabric.composition || fabric.weight || fabric.width) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fabric Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fabric.composition && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Composition
                    </label>
                    <div className="text-sm text-gray-900">
                      {fabric.composition}
                    </div>
                  </div>
                )}
                {fabric.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <div className="text-sm text-gray-900">
                      {fabric.weight} GSM
                    </div>
                  </div>
                )}
                {fabric.width && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width
                    </label>
                    <div className="text-sm text-gray-900">
                      {fabric.width} cm
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
