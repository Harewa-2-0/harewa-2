'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function PaymentVerifyingAnimation() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative mb-8 h-28 w-28">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-[#D4AF37]/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#F4D03F]/10 shadow-inner"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShieldCheck className="h-10 w-10 text-[#B8941F]" strokeWidth={1.75} />
        </motion.div>
      </div>

      <motion.h2
        className="text-2xl font-bold text-gray-900 sm:text-3xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Verifying payment
      </motion.h2>

      <motion.p
        className="mt-3 max-w-sm text-center text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Securing your transaction
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.p>

      <div className="mt-8 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#D4AF37]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
