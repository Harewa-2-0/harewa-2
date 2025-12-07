'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { Category } from './CategoriesTable';
import { useDeleteCategoryMutation } from '@/hooks/useCategories';
import { ButtonSpinner } from '../../components/Spinner';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category; // must include _id, name, productCount?, image?
  onSuccess?: (categoryId: string) => void; // return _id, not slug
}

export default function DeleteCategoryModal({ isOpen, onClose, category, onSuccess }: DeleteCategoryModalProps) {
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  
  // Use React Query mutation
  const deleteMutation = useDeleteCategoryMutation();
  const isLoading = deleteMutation.isPending;

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  const handleDelete = async () => {
    setError(null);

    try {
      if (!category?._id) {
        throw new Error('Missing category identifier (_id).');
      }

      // Use React Query mutation
      const result = await deleteMutation.mutateAsync(category._id);
      console.log('Category deleted successfully:', result);
      addToast('Category deleted successfully!', 'success');

      // Inform parent with the _id we deleted
      onSuccess?.(category._id);

      onClose();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      
      // Handle different types of errors with user-friendly messages
      let errorMessage = 'Failed to delete category. Please try again.';
      
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        errorMessage = 'Request failed. Please check your network connection and try again.';
      } else if (err?.error?.includes('constraint') || err?.message?.includes('constraint')) {
        errorMessage = 'Cannot delete this category because it contains products. Please remove all products first.';
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message && !err.message.includes('aborted')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      addToast(errorMessage, 'error');
    }
  };

  // Click outside to close (overlay only)
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-category-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="delete-category-modal-title" className="text-xl font-semibold text-gray-900">
              Delete Category
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex items-start space-x-4">
            {/* Warning Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this category?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. The category <strong>"{category?.name ?? ''}"</strong> will be permanently removed.
              </p>

              {/* Category Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {category?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-gray-600 text-xs font-medium">
                        {(category?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category?.name ?? ''}</p>
                    <p className="text-xs text-gray-500">{Number(category?.productCount ?? 0)} products</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Warning about products */}
              {Number(category?.productCount ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This category has {Number(category?.productCount ?? 0)} products.
                        Deleting it may affect those products.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? <ButtonSpinner /> : <span>Delete Category</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
