'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeOut } from 'framer-motion';
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Show 9 skeleton cards */}
          {Array.from({ length: 9 }).map((_, index) => (
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {fabrics.map((fabric) => (
            <FabricCard
              key={fabric._id}
              fabric={fabric}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FabricGrid;

