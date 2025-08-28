'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full bg-white text-black text-sm md:text-base py-2 px-4 flex items-center justify-center relative z-50 border-b border-gray-200"
        >
          <p className="text-center max-w-full">
            🔥 Promo Sales for Ready-made Agbada – Use Code <span className="font-semibold text-[#D4AF37]">AJJ346A1</span>
            &nbsp;
            <a href="/shop" className="underline hover:text-[#D4AF37] text-[#D4AF37]">Shop Now</a>
          </p>

          <button
            onClick={() => setVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
