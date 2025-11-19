'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type Fabric } from '@/services/fabric';

interface FabricCardProps {
  fabric: Fabric;
  variants?: any;
}

const FabricCard: React.FC<FabricCardProps> = ({
  fabric,
  variants,
}) => {
  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      {/* Image Only - Not Clickable */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={fabric.image || '/placeholder-fabric.jpg'}
          alt={fabric.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('placeholder-fabric.jpg')) {
              target.src = '/placeholder-fabric.jpg';
            }
          }}
        />
      </div>
    </motion.div>
  );
};

export default FabricCard;

