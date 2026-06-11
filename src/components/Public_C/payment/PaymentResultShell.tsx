'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PaymentResultShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fffdf7] via-white to-[#faf8f2]">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-[#111827]/5 blur-3xl" />

      <header className="relative z-10 border-b border-black/5 bg-black py-4">
        <div className="mx-auto flex max-w-7xl justify-center px-6">
          <Image
            src="/logo.webp"
            alt="HAREWA"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg rounded-3xl border border-[#D4AF37]/15 bg-white/95 p-8 text-center shadow-xl shadow-[#D4AF37]/10 backdrop-blur-sm sm:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
