'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { StepProps } from './types';

export default function ImageUploadStep({ formData, onFormDataChange }: StepProps) {
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    
    // Validate file types
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        addToast(`File "${file.name}" is not a valid image format.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    
    // Limit to 3 images maximum
    const newFiles = validFiles.slice(0, 3 - formData.images.length);
    
    if (newFiles.length > 0) {
      const newImages = [...formData.images, ...newFiles];
      onFormDataChange({ images: newImages });
      
      // Show success toast when all 3 images are uploaded
      const totalImages = formData.images.length + newFiles.length;
      if (totalImages === 3) {
        addToast('All 3 images uploaded successfully!', 'success');
      } else if (newFiles.length > 0) {
        addToast(`${newFiles.length} image${newFiles.length === 1 ? '' : 's'} uploaded successfully!`, 'success');
      }
    } else if (validFiles.length > 3 - formData.images.length) {
      addToast(`You can only upload up to 3 images. ${validFiles.length - (3 - formData.images.length)} image${validFiles.length - (3 - formData.images.length) === 1 ? '' : 's'} were skipped.`, 'error');
    }
  };

  const deleteImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    onFormDataChange({ images: newImages });
    addToast('Image removed successfully!', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-base font-medium text-gray-700 mb-3">
          Product Images
        </label>
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 h-[90%] transition-opacity duration-200 flex items-center justify-center rounded-lg">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 hover:bg-white text-gray-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{previewUrls[index] ? 'Update' : 'Upload'}</span>
                  </button>
                </div>
              </div>
              
              {/* Image Index Label */}
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-500 font-medium">Image {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Drag and Drop Upload Area - Only show if less than 3 images */}
        {formData.images.length < 3 && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-8 py-12 text-center mt-6 ${
              isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-300 bg-white'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-4 text-base text-gray-700">Click to upload images</p>
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
}
