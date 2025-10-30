'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  inline?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPending = false,
  variant = 'danger',
  inline = false
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && !inline) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the dialog
      const focusableElement = dialogRef.current?.querySelector('button:not([disabled])') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    } else if (!isOpen && !inline) {
      // Restore focus when dialog closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, inline]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !inline) {
        onClose();
      }
    };

    if (isOpen && !inline) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, inline]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: 'text-yellow-600'
        };
      default:
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: 'text-blue-600'
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (inline) {
    return (
      <div
        ref={dialogRef}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="mb-3">
          <h3 
            id="dialog-title"
            className="text-base font-medium text-red-900"
          >
            {title}
          </h3>
          <p 
            id="dialog-description"
            className="text-sm text-red-700 mt-1"
          >
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles.confirmButton}`}
            onClick={onConfirm}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {isPending ? 'Processing...' : confirmText}
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={onClose}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {cancelText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <div
          ref={dialogRef}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 
                  id="dialog-title"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p 
                    id="dialog-description"
                    className="text-sm text-gray-500"
                  >
                    {message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:ring-offset-2"
                onClick={onClose}
                disabled={isPending}
                aria-label="Close dialog"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles.confirmButton}`}
              onClick={onConfirm}
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? 'Processing...' : confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:ring-offset-2"
              onClick={onClose}
              disabled={isPending}
              aria-disabled={isPending}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
