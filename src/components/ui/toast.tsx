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
          icon: <CheckCircle size={20} className="text-black" />,
          border: 'border-[#FDC713]'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: <AlertCircle size={20} className="text-white" />,
          border: 'border-red-500'
        };
      case 'info':
        return {
          bg: 'bg-[#F5F5F4]',
          text: 'text-gray-800',
          icon: <Info size={20} className="text-gray-800" />,
          border: 'border-gray-300'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: <Info size={20} className="text-white" />,
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
      className={`p-4 rounded-lg shadow-lg max-w-sm flex items-center gap-3 ${styles.bg} ${styles.text} border ${styles.border}`}
    >
      {styles.icon}
      <span className="flex-1 font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${styles.text} opacity-80 hover:opacity-100 transition-opacity`}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
