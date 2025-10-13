import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/contexts/toast-context';
import { createCustomization, type CustomizationInput } from '@/services/customization';
import OutfitSelector from './OutfitSelector';
import FabricTypeDropdown from './FabricTypeDropdown';
import ColorPalette from './ColorPalette';
import SizeGuide from '@/components/Public_C/Ready_To_Wear/SizeGuide';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  description?: string;
}

interface CustomizationPanelProps {
  product: Product;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ product }) => {
  // Form state
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [selectedOutfitOption, setSelectedOutfitOption] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { addToast } = useToast();

  const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;

  const renderStars = (rating: number = 4) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const handleOutfitSelect = (outfit: string, option: string) => {
    setSelectedOutfit(outfit);
    setSelectedOutfitOption(option);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedOutfit || !selectedOutfitOption) {
      addToast('Please select an outfit type and style', 'error');
      return;
    }

    if (!selectedFabric) {
      addToast('Please select a fabric type', 'error');
      return;
    }

    if (!selectedSize) {
      addToast('Please select a size', 'error');
      return;
    }

    if (selectedColors.length === 0) {
      addToast('Please select at least one color', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const customizationData: CustomizationInput = {
        outfit: selectedOutfit,
        outfitOption: selectedOutfitOption,
        fabricType: selectedFabric,
        size: selectedSize,
        preferredColor: selectedColors.join(' and '),
        additionalNotes: additionalNotes.trim(),
        productId: product._id,
      };

      await createCustomization(customizationData);

      addToast('Customization request submitted successfully! We\'ll contact you soon.', 'success');
      
      // Reset form
      setSelectedOutfit('');
      setSelectedOutfitOption('');
      setSelectedFabric('');
      setSelectedSize('');
      setSelectedColors([]);
      setAdditionalNotes('');

    } catch (error) {
      console.error('Failed to submit customization:', error);
      addToast('Failed to submit customization request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedOutfit && selectedOutfitOption && selectedFabric && selectedSize && selectedColors.length > 0;

  return (
    <>
      <div className="w-full lg:w-auto lg:max-w-sm xl:max-w-md order-3">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Customize Outfit</h1>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-gray-700 truncate">{product.name}</h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-500">({product.reviews || 0})</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            </div>
          </div>

          {/* Outfit Selector */}
          <OutfitSelector
            selectedOutfit={selectedOutfit}
            selectedOutfitOption={selectedOutfitOption}
            onOutfitSelect={handleOutfitSelect}
          />

          {/* Fabric Type Dropdown */}
          <FabricTypeDropdown
            selectedFabric={selectedFabric}
            onFabricSelect={setSelectedFabric}
          />

          {/* Size Guide */}
          <div className="mb-4">
            <div 
              className="flex items-center gap-2 cursor-pointer text-blue-600 hover:underline"
              onClick={() => setIsSizeGuideOpen(true)}
            >
              <Image 
                src="/style_guide.png" 
                alt="Size guide" 
                width={24} 
                height={24}
                className="w-6 h-6"
              />
              <span className="text-sm">Check Size Guide</span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
            <div className="flex gap-2 flex-wrap">
              {['S', 'M', 'L', '1X', '2X'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <ColorPalette
            selectedColors={selectedColors}
            onColorSelect={setSelectedColors}
          />

          {/* Additional Notes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Notes</h3>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Add any specific requirements or modifications..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors text-sm ${
              !isFormValid || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Submitting...</span>
              </div>
            ) : (
              'CUSTOMIZE'
            )}
          </button>

          {/* Form Status */}
          {!isFormValid && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Please complete all required fields
            </p>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />
    </>
  );
};

export default CustomizationPanel;
