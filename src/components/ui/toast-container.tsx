'use client';

import { AnimatePresence } from 'framer-motion';
import Toast from './toast';
import { useToast } from '@/contexts/toast-context';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-3 md:top-4 right-3 md:right-4 left-3 md:left-auto z-[200000] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
