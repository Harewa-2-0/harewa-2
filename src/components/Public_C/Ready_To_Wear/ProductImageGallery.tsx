import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageGalleryProps {
  images: string[];
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedImageIndex,
  onImageSelect,
  productName
}) => {
  const [pulsingIndex, setPulsingIndex] = useState<number | null>(null);

  // Preload all images for instant switching
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach((imageUrl) => {
        const img = new window.Image();
        img.src = imageUrl;
      });
    }
  }, [images]);

  const handleImageClick = (index: number) => {
    setPulsingIndex(index);
    onImageSelect(index);
    
    // Remove pulse effect after animation completes
    setTimeout(() => {
      setPulsingIndex(null);
    }, 300);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block flex-1">
        <div className="flex gap-18">
          {/* Left: Clickable Images */}
          <div className="w-48 flex-shrink-0">
            <div className="flex flex-col gap-4">
              {/* First two images in the same row */}
              <div className="flex gap-3">
                {images?.slice(0, 2).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`w-24 h-24 border-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                      selectedImageIndex === index 
                        ? 'border-[#D4AF37] shadow-md' 
                        : 'border-gray-200 hover:border-[#D4AF37]/50'
                    } ${
                      pulsingIndex === index 
                        ? 'animate-pulse ring-4 ring-[#D4AF37]/30 ring-opacity-75' 
                        : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      sizes="96px"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              
              {/* Third image below (if exists) - full width */}
              {images && images.length > 2 && (
                <button
                  onClick={() => handleImageClick(2)}
                  className={`w-full h-24 border-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                    selectedImageIndex === 2 
                      ? 'border-[#D4AF37] shadow-md' 
                      : 'border-gray-200 hover:border-[#D4AF37]/50'
                  } ${
                    pulsingIndex === 2 
                      ? 'animate-pulse ring-4 ring-[#D4AF37]/30 ring-opacity-75' 
                      : ''
                  }`}
                >
                  <Image
                    src={images[2]}
                    alt={`${productName} 3`}
                    width={192}
                    height={96}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    sizes="192px"
                    loading="lazy"
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Center: Main Image with Animation */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative overflow-hidden rounded-lg w-full max-w-lg h-[400px] bg-gray-100">
              <AnimatePresence initial={false}>
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images?.[selectedImageIndex] || '/placeholder.png'}
                    alt={productName}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={selectedImageIndex === 0}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden pt-24">
        {/* Main Image First with Animation */}
        <div className="mb-6 relative w-full" style={{ height: '320px' }}>
          <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
            <AnimatePresence initial={false}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={images?.[selectedImageIndex] || '/placeholder.png'}
                  alt={productName}
                  fill
                  className="object-cover rounded-lg"
                  sizes="100vw"
                  priority={selectedImageIndex === 0}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Three Images Full Width */}
        <div className="flex gap-2">
          {images?.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`flex-1 aspect-square border-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer relative ${
                selectedImageIndex === index 
                  ? 'border-[#D4AF37] shadow-md' 
                  : 'border-gray-200 hover:border-[#D4AF37]/50'
              } ${
                pulsingIndex === index 
                  ? 'animate-pulse ring-4 ring-[#D4AF37]/30 ring-opacity-75' 
                  : ''
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                sizes="(max-width: 768px) 33vw, 15vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductImageGallery; 