'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { adminAddProduct, type AdminProductInput } from '@/services/products';
import ProductInformationStep from './ProductInformationStep';
import ImageUploadStep from './ImageUploadStep';
import { AddProductModalProps, FormDataPayload } from './types';
import { ButtonSpinner } from '../../../components/Spinner';

// Helper function to convert File to base64 URL (temporary solution)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AddProductModal({ isOpen, onClose, onSubmit, onSuccess }: AddProductModalProps) {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataPayload>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    remainingInStock: '',
    location: '',
    category: '',
    fabricType: '',
    sizes: [],
    gender: 'unisex',
    images: [],
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        remainingInStock: '',
        location: '',
        category: '',
        fabricType: '',
        sizes: [],
        gender: 'unisex',
        images: [],
      });
    }
  }, [isOpen]);

  const handleFormDataChange = (data: Partial<FormDataPayload>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.description || !formData.price || !formData.quantity || !formData.remainingInStock || !formData.location || !formData.category || !formData.fabricType || formData.sizes.length === 0 || !formData.gender) {
        addToast('Please fill in all required fields.', 'error');
        return;
      }
    }
    setCurrentStep(2);
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submission
    if (!formData.name || !formData.description || !formData.price || !formData.quantity || !formData.remainingInStock || !formData.location || !formData.category || !formData.fabricType || formData.sizes.length === 0 || !formData.gender) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    if (formData.images.length === 0) {
      addToast('Please upload at least one product image.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Convert File objects to base64 URLs (temporary solution)
      const imageUrls = await Promise.all(
        formData.images.map(file => fileToBase64(file))
      );

      // Transform form data to match backend structure
      const backendPayload: AdminProductInput = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        remainingInStock: formData.remainingInStock,
        location: formData.location,
        images: imageUrls,
        sizes: formData.sizes,
        gender: formData.gender,
        category: formData.category, // Now uses actual category ID
        fabricType: formData.fabricType, // Now uses actual fabric ID
        // seller: 'default-seller-id', // Default value
        // shop: 'default-shop-id', // Default value
      };

      // Call the backend API
      const result = await adminAddProduct(backendPayload);
      
      console.log('Product created successfully:', result);
      addToast('Product added successfully!', 'success');

      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit(formData);
      }

      // Trigger table refresh
      if (onSuccess) {
        onSuccess(result); // Pass the created product
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      
      let errorMessage = 'Failed to create product. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage = 'Request was cancelled or timed out. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'Server error. Please check the data and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Click outside to close (overlay only)
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="product-modal-title"
    >
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="product-modal-title" className="text-xl font-semibold text-gray-900">
              {currentStep === 1 ? 'Product Information' : 'Add Photos'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                currentStep >= 1 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`ml-3 text-sm ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Product Info
              </span>
            </div>
            <div className="h-0.5 w-8 bg-gray-200"></div>
            <div className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                currentStep >= 2 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-3 text-sm ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Photos
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {currentStep === 1 ? (
            <ProductInformationStep
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onNext={handleNext}
            />
          ) : (
            <ImageUploadStep
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>
            {currentStep === 2 && (
              <button
                onClick={handlePrevious}
                disabled={isLoading}
                className="px-6 py-3 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="rounded-lg bg-[#D4AF37] px-6 py-3 text-base font-medium text-white hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-[#D4AF37] px-6 py-3 text-base font-medium text-white hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors"
              >
                {isLoading ? <ButtonSpinner /> : <span>Save Product</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
