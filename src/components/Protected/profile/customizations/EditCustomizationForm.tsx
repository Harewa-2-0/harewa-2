'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { type CustomizationResponse, type CustomizationInput } from '@/services/customization';
import { useUpdateCustomizationMutation } from '@/hooks/useCustomizations';
import { useToast } from '@/contexts/toast-context';
import OutfitSelector from '@/components/Public_C/customize/OutfitSelector';
import FabricTypeDropdown from '@/components/Public_C/customize/FabricTypeDropdown';
import ColorPalette from '@/components/Public_C/customize/ColorPalette';
import SizeGuide from '@/components/Public_C/Ready_To_Wear/SizeGuide';

interface EditCustomizationFormProps {
  customization: CustomizationResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditCustomizationForm({
  customization,
  onSuccess,
  onCancel
}: EditCustomizationFormProps) {
  const { addToast } = useToast();
  const updateMutation = useUpdateCustomizationMutation();

  // Form state - initialize with current values
  const [selectedOutfit, setSelectedOutfit] = useState(customization.outfit);
  const [selectedOutfitOption, setSelectedOutfitOption] = useState(customization.outfitOption);
  const [selectedFabric, setSelectedFabric] = useState(customization.fabricType);
  const [selectedSize, setSelectedSize] = useState(customization.size);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    customization.preferredColor ? customization.preferredColor.split(' and ') : []
  );
  const [additionalNotes, setAdditionalNotes] = useState(customization.additionalNotes || '');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleOutfitSelect = (outfit: string, option: string) => {
    setSelectedOutfit(outfit);
    setSelectedOutfitOption(option);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const updateData: Partial<CustomizationInput> = {
        outfit: selectedOutfit as CustomizationInput['outfit'],
        outfitOption: selectedOutfitOption,
        fabricType: selectedFabric,
        size: selectedSize,
        preferredColor: selectedColors.join(' and '),
        additionalNotes: additionalNotes.trim(),
      };

      await updateMutation.mutateAsync({
        id: customization._id || customization.id || '',
        data: updateData
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to update customization:', error);
      addToast('Failed to update customization request. Please try again.', 'error');
    }
  };

  const isFormValid = selectedOutfit && selectedOutfitOption && selectedFabric && selectedSize && selectedColors.length > 0;
  const isSubmitting = updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm md:text-lg font-bold">&lt;</span>
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 hidden md:block">Edit Customization</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 md:p-6 space-y-4 md:space-y-8">
          {/* Outfit Selection */}
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Outfit Type & Style</h2>
            <OutfitSelector
              selectedOutfit={selectedOutfit}
              selectedOutfitOption={selectedOutfitOption}
              onOutfitSelect={handleOutfitSelect}
            />
          </div>

          {/* Fabric & Color Selection - Flexed on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Fabric Selection */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Fabric Type</h2>
              <FabricTypeDropdown
                selectedFabric={selectedFabric}
                onFabricSelect={setSelectedFabric}
              />
            </div>

            {/* Color Selection */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Preferred Colors</h2>
              <ColorPalette
                selectedColors={selectedColors}
                onColorsChange={setSelectedColors}
              />
            </div>
          </div>

          {/* Size & Notes Selection - Flexed on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Size</h2>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs md:text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium"
                >
                  Size Guide
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2 md:gap-3">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeSelect(size)}
                    className={`p-2 md:p-3 border rounded-lg text-center text-sm md:text-base font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-white'
                        : 'border-gray-300 text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special requests or measurements..."
                rows={4}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none text-sm md:text-base text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-xs md:text-sm text-gray-500 hidden md:block">
            {!isFormValid && 'Please fill in all required fields to save changes.'}
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex items-center justify-center px-3 py-2 md:px-6 md:py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1 md:gap-2">
                  <Save className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                  <span>Save</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 md:gap-2">
                  <Save className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Save</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Size Guide Modal */}
      <SizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
