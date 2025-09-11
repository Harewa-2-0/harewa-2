'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FormDataPayload) => void;
}

type FormDataPayload = {
  name: string;
  manufacturer: string;
  category: string;
  size: string;
  quantity: string;
  description: string;
  images: File[];
};

const categories = ['Dresses', 'Tops', 'Accessories', 'Shoes'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];

export default function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataPayload>({
    name: '',
    manufacturer: '',
    category: '',
    size: '',
    quantity: '',
    description: '',
    images: [],
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.manufacturer || !formData.category || !formData.size || !formData.quantity || !formData.description) {
        alert('Please fill in all required fields.');
        return;
      }
    }
    setCurrentStep(2);
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) onSubmit(formData);
    console.log('Product data:', formData);
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    
    // Limit to 3 images maximum
    const newFiles = Array.from(files).slice(0, 3 - formData.images.length);
    
    if (newFiles.length > 0) {
      setFormData(prev => {
        const newImages = [...prev.images, ...newFiles];
        return {
          ...prev,
          images: newImages,
        };
      });
      
      // Show success toast when all 3 images are uploaded (moved outside setState)
      const totalImages = formData.images.length + newFiles.length;
      if (totalImages === 3) {
        addToast('All 3 images uploaded successfully!', 'success');
      }
    }
  };

  const deleteImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  // Click outside to close (overlay only)
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Drag & drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const previewUrls = useMemo(
    () => formData.images.map(file => URL.createObjectURL(file)),
    [formData.images]
  );

  useEffect(() => {
    // Revoke blob URLs on unmount/change
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Step 1: Product Information
  const renderStep1 = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
      {/* Product name and Manufacturer in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Product name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Manufacturer<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
      </div>

      {/* Category, Size, and Quantity in one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category<span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c} value={c.toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Size<span className="text-red-500">*</span>
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          >
            <option value="">Select size</option>
            {sizes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Quantity<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
      </div>

      {/* Description - increased rows */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Product description<span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
          required
        />
      </div>
    </form>
  );

  // Step 2: Image Upload
  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Product Photos
        </label>
        <p className="mb-4 text-sm text-gray-500">Upload up to 3 images. The first image will be the main product photo.</p>

        {/* All Images in Flex Row */}
        <div className="flex gap-4">
          {/* Image 1 */}
          <div className="flex-1 group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Image 1</p>
              {previewUrls[0] && (
                <button
                  onClick={() => deleteImage(0)}
                  className="h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                  aria-label="Delete image 1"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-28 w-full overflow-hidden rounded-lg border border-gray-300">
              {previewUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={previewUrls[0]} 
                  alt="Product image 1" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-50">
                  <span className="text-sm text-gray-400">Empty</span>
                </div>
              )}
            </div>
          </div>

          {/* Image 2 */}
          <div className="flex-1 group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Image 2</p>
              {previewUrls[1] && (
                <button
                  onClick={() => deleteImage(1)}
                  className="h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                  aria-label="Delete image 2"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-28 w-full overflow-hidden rounded-lg border border-gray-300">
              {previewUrls[1] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={previewUrls[1]} 
                  alt="Product image 2" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-50">
                  <span className="text-sm text-gray-400">Empty</span>
                </div>
              )}
            </div>
          </div>

          {/* Image 3 */}
          <div className="flex-1 group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Image 3</p>
              {previewUrls[2] && (
                <button
                  onClick={() => deleteImage(2)}
                  className="h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                  aria-label="Delete image 3"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="h-28 w-full overflow-hidden rounded-lg border border-gray-300">
              {previewUrls[2] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={previewUrls[2]} 
                  alt="Product image 3" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-50">
                  <span className="text-sm text-gray-400">Empty</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Area - Only show if less than 3 images */}
        {formData.images.length < 3 && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center ${
              isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-300 bg-white'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div>
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-3 text-sm text-gray-700">Click to upload images</p>
              <p className="text-sm text-gray-400">or drag and drop your files here</p>
              <p className="mt-2 text-sm text-gray-500">
                {formData.images.length === 0 
                  ? 'Up to 3 images (JPG, PNG, GIF)' 
                  : `${3 - formData.images.length} more image${3 - formData.images.length === 1 ? '' : 's'} remaining`
                }
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

      </div>
    </div>
  );

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
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 id="product-modal-title" className="text-base font-semibold text-gray-900">
              {currentStep === 1 ? 'Product Information' : 'Add Photos'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step Indicator */}
          <div className="mt-3 flex items-center space-x-3">
            <div className="flex items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                currentStep >= 1 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`ml-2 text-xs ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Product Info
              </span>
            </div>
            <div className="h-0.5 w-6 bg-gray-200"></div>
            <div className="flex items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                currentStep >= 2 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 text-xs ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Photos
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div>
            {currentStep === 2 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Save Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
