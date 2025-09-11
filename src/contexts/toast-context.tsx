'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export interface ToastType {
  id: number;
  message: string;
  type: "info" | "success" | "error";
}

interface ToastContextType {
  toasts: ToastType[];
  addToast: (message: string, type: ToastType['type']) => number;
  removeToast: (id: number) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const addToast = useCallback((message: string, type: ToastType['type'] = 'info') => {
    const id = Date.now() + Math.random();
    
    // Clear all existing toasts to ensure only one is displayed at a time
    setToasts(prev => {
      // Clear all existing timeouts
      prev.forEach(toast => {
        const timeout = timeoutRefs.current.get(toast.id);
        if (timeout) {
          clearTimeout(timeout);
          timeoutRefs.current.delete(toast.id);
        }
      });
      // Return only the new toast
      return [{ id, message, type }];
    });
    
    // Auto-remove after 2 seconds
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeoutRefs.current.delete(id);
    }, 2000);
    
    timeoutRefs.current.set(id, timeout);
    
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};
