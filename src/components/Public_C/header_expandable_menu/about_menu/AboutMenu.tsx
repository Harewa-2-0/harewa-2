'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface AboutMenuProps {
  isMobile?: boolean;
}

const AboutMenu: React.FC<AboutMenuProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (isMobile) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-white hover:text-[#FFE181] transition-colors cursor-pointer"
        >
          About
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
              <div className="pt-4">
                <div className="bg-white rounded-lg p-4 text-gray-800">
                  <h3 className="text-lg font-semibold mb-2">About HAREWA</h3>
                  <div className="h-px bg-gray-200/80 mb-4" />
                  
                  {/* Mobile layout: stacked */}
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="w-full">
                      <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden">
                        <Image
                          src="/about_img.png"
                          alt="HAREWA About"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3 text-base sm:text-sm">
                      <p>
                        At HAREWA, we are redefining the future of fashion by blending Afrocentric heritage, 
                        contemporary style, and technology-driven innovation. We exist to celebrate Africa's 
                        vibrant culture while creating modern, globally relevant fashion experiences.
                      </p>
                      <p>
                        HAREWA is more than just a fashion website, we're a movement. Our platform showcases 
                        timeless African-inspired designs alongside modern trends, giving our audience access 
                        to authentic styles that tell a story. By integrating technology, we make discovering, 
                        styling, and shopping fashion seamless, interactive, and inspiring.
                      </p>
                      <p>
                        <span className="font-semibold text-[#D4AF37]">Our mission</span> is to become the go-to 
                        platform for Afrocentric and contemporary fashion, merging creativity and technology to 
                        connect people with styles that inspire confidence and celebrate diversity.
                      </p>
                      <p>
                        <span className="font-semibold text-[#D4AF37]">Our Vision</span> is a world where 
                        African-inspired fashion holds its place on the global stage, powered by innovation, 
                        accessibility, and cultural pride.
                      </p>
                    </div>
                  </div>
                </div>
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
        About
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
            className="absolute top-full -left-50 mt-2 w-[960px] max-w-[95vw] bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About HAREWA</h3>
              <div className="h-px bg-gray-200/80 mb-6" />
              
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Image */}
                <div className="w-full lg:w-2/5">
                  <div className="relative w-full h-48 lg:h-64 rounded-lg overflow-hidden">
                    <Image
                      src="/about_img.png"
                      alt="HAREWA About"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px bg-gray-200/80 mx-2" />

                {/* Right: Content */}
                <div className="w-full lg:w-3/5 space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    At HAREWA, we are redefining the future of fashion by blending Afrocentric heritage, 
                    contemporary style, and technology-driven innovation. We exist to celebrate Africa's 
                    vibrant culture while creating modern, globally relevant fashion experiences.
                  </p>
                  <p>
                    HAREWA is more than just a fashion website, we're a movement. Our platform showcases 
                    timeless African-inspired designs alongside modern trends, giving our audience access 
                    to authentic styles that tell a story. By integrating technology, we make discovering, 
                    styling, and shopping fashion seamless, interactive, and inspiring.
                  </p>
                  <p>
                    <span className="font-semibold text-[#D4AF37]">Our mission</span> is to become the go-to 
                    platform for Afrocentric and contemporary fashion, merging creativity and technology to 
                    connect people with styles that inspire confidence and celebrate diversity.
                  </p>
                  <p>
                    <span className="font-semibold text-[#D4AF37]">Our Vision</span> is a world where 
                    African-inspired fashion holds its place on the global stage, powered by innovation, 
                    accessibility, and cultural pride.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AboutMenu;
