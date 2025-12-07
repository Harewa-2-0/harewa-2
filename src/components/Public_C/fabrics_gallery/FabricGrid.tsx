'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeOut } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FabricCard from './FabricCard';
import { type Fabric } from '@/services/fabric';

interface FabricGridProps {
  fabrics: Fabric[];
  loading?: boolean;
}

const FabricGrid: React.FC<FabricGridProps> = ({
  fabrics,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination: 10 per page on mobile, 12 per page on desktop
  const itemsPerPageMobile = 10;
  const itemsPerPageDesktop = 12;
  
  // Use mobile limit initially, will be adjusted by CSS for desktop
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageMobile);
  
  // Detect screen size for pagination
  React.useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024; // xl breakpoint
      setItemsPerPage(isDesktop ? itemsPerPageDesktop : itemsPerPageMobile);
      // Reset to page 1 when switching between mobile/desktop
      setCurrentPage(1);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(fabrics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFabrics = fabrics.slice(startIndex, endIndex);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show skeleton cards */}
          {Array.from({ length: itemsPerPageMobile }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-64 bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fabrics.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Illustration */}
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <img
              src="/unauthorized.png"
              alt="No Fabrics"
              width={128}
              height={128}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No fabrics available
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            We couldn't find any fabrics at the moment. 
            Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedFabrics.map((fabric) => (
            <FabricCard
              key={fabric._id}
              fabric={fabric}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FabricGrid;

