'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastType } from '@/contexts/toast-context';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: number) => void;
}

const Toast = ({ toast, onRemove }: ToastProps) => {
  const getToastStyles = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#FDC713]',
          text: 'text-black',
          icon: <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-black flex-shrink-0" />,
          border: 'border-[#FDC713]'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />,
          border: 'border-red-500'
        };
      case 'info':
        return {
          bg: 'bg-[#F5F5F4]',
          text: 'text-gray-800',
          icon: <Info className="w-4 h-4 md:w-5 md:h-5 text-gray-800 flex-shrink-0" />,
          border: 'border-gray-300'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: <Info className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />,
          border: 'border-gray-500'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`p-2 md:p-4 rounded-md md:rounded-lg shadow-lg max-w-[240px] md:max-w-sm flex items-center gap-1.5 md:gap-3 ${styles.bg} ${styles.text} border ${styles.border}`}
    >
      {styles.icon}
      <span className="flex-1 font-normal md:font-medium text-xs md:text-base leading-snug md:leading-normal">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${styles.text} opacity-80 hover:opacity-100 transition-opacity flex-shrink-0`}
        aria-label="Close toast"
      >
        <X className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
