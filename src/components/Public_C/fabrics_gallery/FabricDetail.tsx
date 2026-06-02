'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, Loader2, Ruler, Layers } from 'lucide-react';
import { useFabricByIdQuery } from '@/hooks/useFabrics';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import {
  formatFabricBundlePrice,
  getFabricBundleLabel,
  getMaxFabricBundles,
  isFabricPurchasable,
} from '@/utils/fabricDisplay';

interface FabricDetailProps {
  fabricId: string;
}

export default function FabricDetail({ fabricId }: FabricDetailProps) {
  const { data: fabric, isLoading, error } = useFabricByIdQuery(fabricId);
  const [bundleQty, setBundleQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addFabricToCart } = useAuthAwareCartActions();
  const { addToast } = useToast();

  const purchasable = fabric ? isFabricPurchasable(fabric) : false;
  const maxBundles = fabric ? getMaxFabricBundles(fabric) : 0;

  const handleAddToCart = async () => {
    if (!fabric || !purchasable) return;

    if (maxBundles > 0 && bundleQty > maxBundles) {
      addToast(`Only ${maxBundles} bundle(s) available`, 'error');
      return;
    }

    setIsAdding(true);
    try {
      await addFabricToCart({
        id: fabric._id,
        quantity: bundleQty,
        price: fabric.bundlePrice,
        name: fabric.name,
        image: fabric.image,
        yardBundle: fabric.yardBundle,
      });
      addToast(
        `Added ${bundleQty} × ${fabric.yardBundle}-yard bundle to cart`,
        'success'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add to cart';
      addToast(message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !fabric) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <p className="text-gray-600 mb-6">We couldn&apos;t find this fabric.</p>
        <Link
          href="/fabrics"
          className="inline-flex items-center gap-2 text-[#B8941F] font-medium hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to gallery
        </Link>
      </div>
    );
  }

  const lineTotal =
    purchasable && fabric.bundlePrice
      ? fabric.bundlePrice * bundleQty
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 pb-14"
    >
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <Link
          href="/fabrics"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B8941F] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Fabrics gallery
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-gray-100 shadow-lg shadow-black/5 ring-1 ring-black/5"
        >
          <img
            src={fabric.image || '/placeholder-fabric.jpg'}
            alt={fabric.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-fabric.jpg';
            }}
          />
          {purchasable && (
            <div className="absolute top-4 left-4 rounded-full bg-[#D4AF37] text-white text-xs font-semibold px-3 py-1.5 shadow-lg">
              {getFabricBundleLabel(fabric)} bundle
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex flex-col lg:py-1"
        >
          <p className="text-sm font-medium text-[#B8941F] uppercase tracking-wider mb-2">
            {fabric.type}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">
            {fabric.name}
          </h1>
          <p className="text-gray-600 mb-4">{fabric.color}</p>

          {purchasable ? (
            <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 to-white p-5 mb-5">
              <p className="text-xl font-bold text-gray-900">
                {formatFabricBundlePrice(fabric)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Sold in whole bundles
              </p>
              {typeof fabric.stockBundles === 'number' && fabric.stockBundles > 0 && (
                <p className="text-xs text-[#B8941F] mt-2 font-medium">
                  {fabric.stockBundles} bundle{fabric.stockBundles === 1 ? '' : 's'} left
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-5">
              <p className="text-sm text-gray-600">
                This fabric is for gallery reference only and is not available for online purchase yet.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 mb-5 text-sm">
            {fabric.pattern && (
              <SpecChip icon={<Layers className="w-4 h-4" />} label="Pattern" value={fabric.pattern} />
            )}
            {fabric.weight && (
              <SpecChip icon={<Ruler className="w-4 h-4" />} label="Weight" value={`${fabric.weight} g/m²`} />
            )}
            {fabric.width && (
              <SpecChip icon={<Ruler className="w-4 h-4" />} label="Width" value={`${fabric.width} cm`} />
            )}
            {fabric.composition && (
              <SpecChip icon={<Layers className="w-4 h-4" />} label="Composition" value={fabric.composition} />
            )}
          </div>

          {purchasable && (
            <div className="mt-auto space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of bundles
                </label>
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBundleQty((q) => Math.max(1, q - 1))}
                    className="p-3 text-gray-600 hover:bg-[#D4AF37]/10 hover:text-[#B8941F] transition-colors cursor-pointer"
                    aria-label="Decrease bundles"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                    {bundleQty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBundleQty((q) =>
                        maxBundles > 0 ? Math.min(maxBundles, q + 1) : q + 1
                      )
                    }
                    disabled={maxBundles > 0 && bundleQty >= maxBundles}
                    className="p-3 text-gray-600 hover:bg-[#D4AF37]/10 hover:text-[#B8941F] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase bundles"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  = {bundleQty * (fabric.yardBundle ?? 0)} yards total
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isAdding || (maxBundles === 0)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] text-white font-semibold py-4 shadow-lg shadow-[#D4AF37]/25 hover:bg-[#B8941F] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                {maxBundles === 0
                  ? 'Out of stock'
                  : `Add to cart — ${formatPrice(lineTotal)}`}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function SpecChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white border border-gray-100 p-3">
      <span className="text-[#D4AF37] mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
