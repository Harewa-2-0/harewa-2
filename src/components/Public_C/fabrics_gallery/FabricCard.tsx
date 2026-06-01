'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { type Fabric } from '@/services/fabric';
import {
  formatFabricBundlePrice,
  isFabricPurchasable,
} from '@/utils/fabricDisplay';

interface FabricCardProps {
  fabric: Fabric;
  variants?: {
    hidden?: { opacity: number; y: number };
    visible?: { opacity: number; y: number; transition?: { duration: number; ease: number[] } };
  };
}

const FabricCard: React.FC<FabricCardProps> = ({ fabric, variants }) => {
  const purchasable = isFabricPurchasable(fabric);

  return (
    <motion.div variants={variants} className="group">
      <Link
        href={`/fabrics/${fabric._id}`}
        className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl ring-1 ring-transparent hover:ring-[#D4AF37]/30 transition-all duration-300"
      >
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            src={fabric.image || '/placeholder-fabric.jpg'}
            alt={fabric.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder-fabric.jpg')) {
                target.src = '/placeholder-fabric.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {purchasable ? (
            <span className="absolute top-3 right-3 rounded-full bg-[#D4AF37] text-white text-xs font-semibold px-2.5 py-1 shadow-md">
              {fabric.yardBundle} yd
            </span>
          ) : (
            <span className="absolute top-3 right-3 rounded-full bg-white/90 text-gray-600 text-xs font-medium px-2.5 py-1">
              Gallery
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#B8941F] transition-colors">
            {fabric.name}
          </h3>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {fabric.type} · {fabric.color}
          </p>
          {purchasable ? (
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {formatFabricBundlePrice(fabric)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400">View details</p>
          )}
          <motion.span
            className="mt-3 inline-flex items-center text-xs font-medium text-[#B8941F]"
            initial={false}
            whileHover={{ x: 2 }}
          >
            {purchasable ? 'Shop bundle →' : 'View fabric →'}
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
};

export default FabricCard;
