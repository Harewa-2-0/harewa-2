'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CartLine } from '@/store/cartStore';
import {
  formatCartLineMeta,
  formatCartLineUnitPrice,
  getCartLineKey,
  getCartLineSubtotal,
} from '@/utils/cartDisplay';
import { formatPrice } from '@/utils/currency';

interface CartSummaryLineCardProps {
  item: CartLine;
  onRemove?: (item: CartLine) => void;
  isPending?: boolean;
  showRemove?: boolean;
}

export default function CartSummaryLineCard({
  item,
  onRemove,
  isPending = false,
  showRemove = true,
}: CartSummaryLineCardProps) {
  const name = item.name || (item.lineType === 'fabric' ? 'Fabric' : 'Product');
  const image = item.image || '/placeholder-fabric.jpg';
  const isFabric = item.lineType === 'fabric';
  const lineTotal = getCartLineSubtotal(item);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.25 } }}
      className={`relative flex gap-3 p-4 rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isFabric ? 'border-[#D4AF37]/25 ring-1 ring-[#D4AF37]/10' : 'border-gray-100'
      }`}
    >
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item)}
          disabled={isPending}
          aria-label="Remove item"
          className="absolute -top-2.5 -right-2.5 h-8 w-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shadow-md hover:bg-[#B8941F] hover:scale-105 transition disabled:opacity-50"
        >
          <X size={16} />
        </button>
      )}

      <div
        className={`w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
          isFabric ? 'ring-1 ring-[#D4AF37]/30' : 'bg-gray-100'
        }`}
      >
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        {isFabric && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#B8941F]">
            Fabric bundle
          </span>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{formatCartLineUnitPrice(item)}</p>
        <p className="text-xs text-gray-600 mt-1">{formatCartLineMeta(item)}</p>
        <p className="text-sm font-semibold text-gray-900 mt-2">{formatPrice(lineTotal)}</p>
      </div>
    </motion.div>
  );
}

export { getCartLineKey };
