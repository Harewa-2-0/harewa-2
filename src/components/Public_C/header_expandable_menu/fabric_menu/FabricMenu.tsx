'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFabricsQuery } from '@/hooks/useFabrics';
import { type Fabric } from '@/services/fabric';

interface FabricMenuProps {
  isMobile?: boolean;
}

const FabricMenu: React.FC<FabricMenuProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // React Query: Fetch fabrics (cached 10min, shared across components)
  const { data: fabrics = [], isLoading } = useFabricsQuery();
  
  // Limit fabrics for display: 3 for mobile, 5 for desktop
  const displayLimit = isMobile ? 3 : 5;
  const displayedFabrics = fabrics.slice(0, displayLimit);
  // Show "View More" if there are fabrics (even if exactly at limit, to navigate to full page)
  const showViewMore = fabrics.length > 0 && !isLoading;

  // Auto-select first fabric when data loads
  useEffect(() => {
    if (fabrics.length > 0 && !selectedFabric) {
      setSelectedFabric(fabrics[0]);
    }
  }, [fabrics, selectedFabric]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFabricClick = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    // REMOVED: Don't close menu on mobile when selecting fabric
    // if (isMobile) {
    //   setIsOpen(false);
    // }
  };

  // Create unique image sources for display - only 2 for mobile
  const getFabricImages = (fabric: Fabric) => {
    const baseImage = fabric.image || '/placeholder-fabric.jpg';
    const images = [];
    
    // Check if it's a base64 data URL
    const isBase64 = baseImage.startsWith('data:');
    
    // Mobile gets 2 images, desktop gets 4
    const imageCount = isMobile ? 2 : 4;
    
    for (let i = 0; i < imageCount; i++) {
      if (isBase64) {
        // For base64 images, we can't add query params, so just use the same image
        // The key uniqueness will handle the React rendering issues
        images.push(baseImage);
      } else {
        // For regular URLs, add variant parameter to prevent caching
        const imageUrl = baseImage.includes('?') 
          ? `${baseImage}&variant=${i}` 
          : `${baseImage}?variant=${i}`;
        images.push(imageUrl);
      }
    }
    return images;
  };

  if (isMobile) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-white hover:text-[#FFE181] transition-colors cursor-pointer"
        >
          Fabrics Gallery
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Fabric List - Limited Items */}
                <div className="space-y-2">
                  {isLoading ? (
                    Array.from({ length: displayLimit }).map((_, index) => (
                      <div key={index} className="h-8 bg-gray-700 rounded animate-pulse" />
                    ))
                  ) : (
                    <>
                      {displayedFabrics.map((fabric) => (
                        <button
                          key={fabric._id}
                          onClick={() => handleFabricClick(fabric)}
                          className={`w-full text-left px-3 py-2 rounded transition-colors cursor-pointer ${
                            selectedFabric?._id === fabric._id
                              ? 'bg-[#D4AF37] text-black'
                              : 'text-white hover:bg-gray-700'
                          }`}
                        >
                          {fabric.name}
                        </button>
                      ))}
                      {/* View More Button - Distinct styling from fabric items */}
                      {showViewMore && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            router.push('/fabrics');
                          }}
                          className="w-full px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-[#B8941F] transition-colors cursor-pointer mt-3 text-center"
                        >
                          View More →
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Selected Fabric Images - 2 images in 1 row */}
                {selectedFabric && (
                  <div className="pt-4">
                    <h3 className="text-white font-medium mb-3">{selectedFabric.name} Prints</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {getFabricImages(selectedFabric).map((image, index) => (
                        <div key={`${selectedFabric._id}-${index}`} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedFabric.name} print ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Only fallback to placeholder if it's not already a placeholder
                              if (!target.src.includes('placeholder-fabric.jpg')) {
                                target.src = '/placeholder-fabric.jpg';
                              }
                            }}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.opacity = '1';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={menuRef}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-2 text-white hover:text-[#FFE181] transition-colors cursor-pointer"
      >
        Fabrics Gallery
        <ChevronDown size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-6">
              <div className="flex gap-8">
                {/* Left: Fabric List - Limited Items */}
                <div className="w-2/5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Fabric</h3>
                  <div className="space-y-2">
                    {isLoading ? (
                      Array.from({ length: displayLimit }).map((_, index) => (
                        <div key={index} className="h-8 bg-gray-200 rounded animate-pulse" />
                      ))
                    ) : (
                      <>
                        {displayedFabrics.map((fabric) => (
                          <button
                            key={fabric._id}
                            onClick={() => handleFabricClick(fabric)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                              selectedFabric?._id === fabric._id
                                ? 'bg-[#D4AF37BD]/35 text-[#D4AF37] border-[#D4AF37]'
                                : 'text-gray-700 hover:bg-gray-100 border-transparent'
                            }`}
                          >
                            <span className="text-sm font-medium">{fabric.name}</span>
                            <ChevronRight size={14} className={selectedFabric?._id === fabric._id ? 'text-[#D4AF37]' : 'text-gray-500'} />
                          </button>
                        ))}
                        {/* View More Button - Distinct styling from fabric items */}
                        {showViewMore && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              router.push('/fabrics');
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold hover:bg-[#B8941F] transition-colors cursor-pointer mt-3 text-center flex items-center justify-center gap-2"
                          >
                            <span>View More</span>
                            <ChevronRight size={16} className="text-black" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Fabric Images */}
                <div className="w-3/5">
                  {selectedFabric ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {selectedFabric.name} Prints
                      </h3>
                      <div className="grid grid-cols-4 gap-6 h-30">
                        {getFabricImages(selectedFabric).map((image, index) => (
                          <div key={`${selectedFabric._id}-${index}`} className="rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${selectedFabric.name} print ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-all duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Only fallback to placeholder if it's not already a placeholder
                                if (!target.src.includes('placeholder-fabric.jpg')) {
                                  target.src = '/placeholder-fabric.jpg';
                                }
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.opacity = '1';
                              }}
                              style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-36 text-gray-500">
                      Select a fabric to view prints
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FabricMenu ;