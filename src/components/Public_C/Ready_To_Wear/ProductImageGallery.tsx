import React from 'react';

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
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block flex-1">
        <div className="flex gap-18">
          {/* Left: Clickable Images */}
          <div className="w-40 flex-shrink-0">
            <div className="flex flex-col gap-4">
              {/* First two images in the same row */}
              <div className="grid grid-cols-2 gap-12">
                {images?.slice(0, 2).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onImageSelect(index)}
                    className={`w-24 h-24 border-2 rounded-lg overflow-hidden ${selectedImageIndex === index ? 'border-yellow-400' : 'border-gray-200'}`}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Third image below (if exists) */}
              {images && images.length > 2 && (
                <button
                  onClick={() => onImageSelect(2)}
                  className={`w-50 h-24 border-2 rounded-lg overflow-hidden ${selectedImageIndex === 2 ? 'border-yellow-400' : 'border-gray-200'}`}
                >
                  <img
                    src={images[2]}
                    alt={`${productName} 3`}
                    className="w-full h-full object-cover"
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Center: Main Image */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={images?.[selectedImageIndex] || '/placeholder.png'}
              alt={productName}
              className="w-full max-w-md h-[400px] object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden pt-24">
        {/* Main Image First */}
        <div className="mb-6">
          <img
            src={images?.[selectedImageIndex] || '/placeholder.png'}
            alt={productName}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>
        
        {/* Three Images Full Width */}
        <div className="flex gap-2">
          {images?.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`flex-1 aspect-square border-2 rounded-lg overflow-hidden ${selectedImageIndex === index ? 'border-yellow-400' : 'border-gray-200'}`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductImageGallery; 