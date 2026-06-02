'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FabricsTable, { type Fabric } from './FabricsTable';
import AddFabricModal from './AddFabricModal';

export default function FabricsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [fabricCount, setFabricCount] = useState(0);
  const tableRef = useRef<{ refresh: () => void; addFabric: (fabric: Fabric) => void } | null>(null);

  const sellableHint = useMemo(
    () => ({
      title: 'Bundle sales',
      detail: '4 or 6 yard packs · not customizable',
    }),
    []
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Fabrics{' '}
            <motion.span
              key={fabricCount}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg font-normal text-[#B8941F]"
            >
              ({fabricCount})
            </motion.span>
          </h1>
          <p className="text-gray-600 mt-1">Manage catalog and yard-bundle pricing for online sales</p>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-1.5 text-xs text-[#B8941F]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="font-medium">{sellableHint.title}</span>
            <span className="text-gray-500">· {sellableHint.detail}</span>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl hover:bg-[#D4AF37]/90 shadow-md shadow-[#D4AF37]/20 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Add Fabric</span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <FabricsTable ref={tableRef as React.Ref<{ refresh: () => void; addFabric: (fabric: Fabric) => void }>} onFabricCountChange={setFabricCount} />
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <AddFabricModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={(newFabric) => {
              tableRef.current?.addFabric?.(newFabric);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
