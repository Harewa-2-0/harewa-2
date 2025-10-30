import React, { useState } from 'react';

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

  const handleImageClick = (index: number) => {
    setPulsingIndex(index);
    onImageSelect(index);
    
    // Remove pulse effect after animation completes
    setTimeout(() => {
      setPulsingIndex(null);
    }, 600);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
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
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
                  <img
                    src={images[2]}
                    alt={`${productName} 3`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Center: Main Image */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative overflow-hidden rounded-lg">
              <img
                key={selectedImageIndex}
                src={images?.[selectedImageIndex] || '/placeholder.png'}
                alt={productName}
                className="w-full max-w-lg h-[400px] object-cover transition-all duration-500 ease-in-out transform"
                style={{
                  animation: 'fadeInScale 0.5s ease-in-out'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden pt-24">
        {/* Main Image First */}
        <div className="mb-6 relative overflow-hidden rounded-lg">
          <img
            key={selectedImageIndex}
            src={images?.[selectedImageIndex] || '/placeholder.png'}
            alt={productName}
            className="w-full h-80 object-cover transition-all duration-500 ease-in-out transform"
            style={{
              animation: 'fadeInScale 0.5s ease-in-out'
            }}
          />
        </div>
        
        {/* Three Images Full Width */}
        <div className="flex gap-2">
          {images?.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`flex-1 aspect-square border-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedImageIndex === index 
                  ? 'border-[#D4AF37] shadow-md' 
                  : 'border-gray-200 hover:border-[#D4AF37]/50'
              } ${
                pulsingIndex === index 
                  ? 'animate-pulse ring-4 ring-[#D4AF37]/30 ring-opacity-75' 
                  : ''
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductImageGallery; 