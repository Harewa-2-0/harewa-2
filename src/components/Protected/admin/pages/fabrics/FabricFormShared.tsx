'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/utils/currency';
import type { YardBundle } from '@/services/fabric';

export const GOLD = '#D4AF37';
export const GOLD_DARK = '#B8941F';

export type FabricCommerceFormState = {
  isSellable: boolean;
  yardBundle: YardBundle | '';
  bundlePrice: string;
  stockBundles: string;
  supplier: string;
  inStock: boolean;
};

export const defaultCommerceState: FabricCommerceFormState = {
  isSellable: false,
  yardBundle: '',
  bundlePrice: '',
  stockBundles: '0',
  supplier: '',
  inStock: true,
};

export function validateCommerceStep(data: FabricCommerceFormState): string | null {
  if (!data.supplier.trim()) {
    return 'Supplier is required';
  }
  if (!data.isSellable) return null;
  if (data.yardBundle !== 4 && data.yardBundle !== 6) {
    return 'Select a bundle size: 4 or 6 yards';
  }
  const price = Number(data.bundlePrice);
  if (!Number.isFinite(price) || price <= 0) {
    return 'Enter a bundle price greater than 0';
  }
  const stock = Number(data.stockBundles);
  if (!Number.isFinite(stock) || stock < 0) {
    return 'Stock must be 0 or more bundles';
  }
  return null;
}

const stepVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

export function FabricStepPanel({
  stepKey,
  children,
}: {
  stepKey: string | number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const STEPS = ['Basic', 'Specifications', 'Sale & Stock', 'Review'] as const;

export function FabricStepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8 gap-1">
      {STEPS.map((label, idx) => {
        const n = idx + 1;
        const active = step === n;
        const completed = step > n;
        return (
          <div key={label} className="flex-1 flex items-center min-w-0">
            <motion.div
              layout
              className={`flex items-center justify-center h-8 w-8 shrink-0 rounded-full text-sm font-semibold mr-2 transition-colors duration-300 ${
                completed
                  ? 'bg-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/30'
                  : active
                    ? 'border-2 border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                    : 'bg-gray-100 text-gray-500'
              }`}
              animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                n
              )}
            </motion.div>
            <span
              className={`text-xs sm:text-sm truncate ${
                active ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-shadow duration-200';

type BundleFieldsProps = {
  values: FabricCommerceFormState;
  onFieldChange: (
    name: keyof FabricCommerceFormState,
    value: string | boolean | YardBundle
  ) => void;
};

export function FabricBundlePricingFields({ values, onFieldChange }: BundleFieldsProps) {
  const bundleLabel =
    values.yardBundle === 4 || values.yardBundle === 6
      ? `${values.yardBundle} yards`
      : 'bundle';

  const previewPrice =
    values.isSellable && values.bundlePrice && Number(values.bundlePrice) > 0
      ? formatPrice(Number(values.bundlePrice))
      : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/8 via-white to-white p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sell this fabric online</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-md">
              Customers buy fixed 4- or 6-yard bundles. Fabrics are not customizable — only sold as material packs.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.isSellable}
            onClick={() => onFieldChange('isSellable', !values.isSellable)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
              values.isSellable ? 'bg-[#D4AF37]' : 'bg-gray-200'
            }`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 ${
                values.isSellable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </motion.div>

      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1.5">
          Supplier *
        </label>
        <input
          id="supplier"
          name="supplier"
          type="text"
          value={values.supplier}
          onChange={(e) => onFieldChange('supplier', e.target.value)}
          placeholder="Fabric Depot Ltd."
          className={inputClass}
        />
      </div>

      <AnimatePresence>
        {values.isSellable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden space-y-6"
          >
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Bundle size *</p>
              <div className="grid grid-cols-2 gap-3">
                {([4, 6] as YardBundle[]).map((yards) => {
                  const selected = values.yardBundle === yards;
                  return (
                    <motion.button
                      key={yards}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFieldChange('yardBundle', yards)}
                      className={`relative rounded-2xl border-2 p-4 text-left transition-shadow duration-300 ${
                        selected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md shadow-[#D4AF37]/15'
                          : 'border-gray-200 bg-white hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-white"
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.span>
                      )}
                      <span className="text-2xl font-bold text-gray-900">{yards}</span>
                      <span className="block text-sm text-gray-600">yards per bundle</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bundlePrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price per {bundleLabel} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    id="bundlePrice"
                    name="bundlePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.bundlePrice}
                    onChange={(e) => onFieldChange('bundlePrice', e.target.value)}
                    placeholder="12000"
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="stockBundles" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock (bundles) *
                </label>
                <input
                  id="stockBundles"
                  name="stockBundles"
                  type="number"
                  step="1"
                  min="0"
                  value={values.stockBundles}
                  onChange={(e) => onFieldChange('stockBundles', e.target.value)}
                  placeholder="10"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">Whole bundles available to sell</p>
              </div>
            </div>

            {previewPrice && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-[#B8941F] font-semibold">
                  Customer sees
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {previewPrice}{' '}
                  <span className="text-sm font-normal text-gray-600">
                    per {values.yardBundle}-yard bundle
                  </span>
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
        <input
          id="inStock"
          name="inStock"
          type="checkbox"
          checked={values.inStock}
          onChange={(e) => onFieldChange('inStock', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
        />
        <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
          Mark as in stock {values.isSellable ? '(visible when bundles remain)' : '(catalog)'}
        </label>
      </div>
    </div>
  );
}

export function FabricCommerceReview({
  commerce,
}: {
  commerce: FabricCommerceFormState;
}) {
  return (
  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-[#B8941F]">Online sale</p>
    {commerce.isSellable ? (
      <>
        <p className="text-sm text-gray-900">
          <span className="text-gray-500">Bundle:</span>{' '}
          {commerce.yardBundle} yards @{' '}
          {commerce.bundlePrice ? formatPrice(Number(commerce.bundlePrice)) : '—'}
        </p>
        <p className="text-sm text-gray-900">
          <span className="text-gray-500">Stock:</span> {commerce.stockBundles || '0'} bundle(s)
        </p>
      </>
    ) : (
      <p className="text-sm text-gray-600">Catalog only — not listed for purchase</p>
    )}
    <p className="text-sm text-gray-900">
      <span className="text-gray-500">Supplier:</span> {commerce.supplier || '—'}
    </p>
    <p className="text-sm text-gray-900">
      <span className="text-gray-500">In stock:</span> {commerce.inStock ? 'Yes' : 'No'}
    </p>
  </div>
  );
}

export const fabricModalMotion = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  panel: {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2 } },
  },
};
