'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#D4AF37', '#F4D03F', '#111827', '#ffffff', '#B8941F', '#fef3c7'];

type Particle = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
};

export default function PaymentConfetti({ active }: { active: boolean }) {
  const particles = useMemo<Particle[]>(() => {
    if (!active) return [];
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 2.2 + Math.random() * 1.4,
      rotate: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '-4%',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            opacity: [1, 1, 0],
            rotate: p.rotate,
            x: [0, (Math.random() - 0.5) * 120],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
        />
      ))}
    </div>
  );
}
