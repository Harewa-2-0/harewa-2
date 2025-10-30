'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { StepProps } from './types';

// Image compression utility
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1920)
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let { width, height } = img;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = (height / width) * MAX_WIDTH;
            width = MAX_WIDTH;
          } else {
            width = (width / height) * MAX_HEIGHT;
            height = MAX_HEIGHT;
          }
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with 85% quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.jpg'),
              { type: 'image/jpeg' }
            );

            console.log(`[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default function ImageUploadStep({ formData, onFormDataChange }: StepProps) {
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalKB: number;
    compressedKB: number;
    savings: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = async (files: FileList | null) => {
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
    const filesToProcess = validFiles.slice(0, 3 - formData.images.length);
    
    if (filesToProcess.length === 0) {
      if (validFiles.length > 3 - formData.images.length) {
        addToast(`You can only upload up to 3 images. ${validFiles.length - (3 - formData.images.length)} image${validFiles.length - (3 - formData.images.length) === 1 ? '' : 's'} were skipped.`, 'error');
      }
      return;
    }

    // Compress images
    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map(file => compressImage(file))
      );

      const newImages = [...formData.images, ...compressedFiles];
      onFormDataChange({ images: newImages });
      
      // Show success toast
      const totalImages = formData.images.length + compressedFiles.length;
      if (totalImages === 3) {
        addToast('All 3 images uploaded and optimized successfully!', 'success');
      } else if (compressedFiles.length > 0) {
        addToast(`${compressedFiles.length} image${compressedFiles.length === 1 ? '' : 's'} uploaded and optimized!`, 'success');
      }
    } catch (error) {
      console.error('[ImageUpload] Compression error:', error);
      addToast('Failed to process images. Please try again.', 'error');
    } finally {
      setIsCompressing(false);
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
      {/* Compression Indicator */}
      {isCompressing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium text-blue-800">Optimizing images...</span>
        </div>
      )}

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
                    disabled={isCompressing}
                    className="bg-white/90 hover:bg-white text-gray-800 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            } ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isCompressing && fileInputRef.current?.click()}
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
              <p className="mt-1 text-xs text-gray-400">
                Images will be automatically optimized for web
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={isCompressing}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}