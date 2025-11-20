'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { generateSlug } from './utils';
import { useCreateCategoryMutation } from '@/hooks/useCategories';
import { ButtonSpinner } from '../../components/Spinner';

export interface CategoryFormData {
  name: string;
  description: string;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: any) => void; // The created category from API
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);
  
  // Use React Query mutation
  const createMutation = useCreateCategoryMutation();
  const isLoading = createMutation.isPending;

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', description: '' });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      addToast('Please enter a category name.', 'error');
      return;
    }
    if (!description) {
      addToast('Please enter a category description.', 'error');
      return;
    }

    // Backend requires { id, name, description }
    // where "id" is your slug (must NOT be empty)
    let slug = generateSlug ? generateSlug(name) : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    slug = slug || 'unnamed'; // ensure non-empty to avoid dup key on null

    const payload = {
      id: slug,
      name,
      description,
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      addToast('Category created successfully!', 'success');

      // Notify parent with the created category data
      onSuccess?.(created);

      onClose();
      // Reset form
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      console.error('Error creating category:', err);
      
      // Handle different types of errors with user-friendly messages
      let errorMessage = 'Failed to create category. Please try again.';
      
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        errorMessage = 'Request failed. Please check your network connection and try again.';
      } else if (err?.error?.includes('E11000') || err?.message?.includes('duplicate')) {
        errorMessage = 'A category with this name already exists. Please choose a different name.';
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message && !err.message.includes('aborted')) {
        errorMessage = err.message;
      }
      
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
      aria-labelledby="category-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="category-modal-title" className="text-xl font-semibold text-gray-900">
              Add New Category
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
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] disabled:bg-gray-50 disabled:cursor-not-allowed text-black"
                disabled={isLoading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] disabled:bg-gray-50 disabled:cursor-not-allowed resize-none text-black"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#D4AF37] text-white text-sm font-medium rounded-lg hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? <ButtonSpinner /> : <span>Create Category</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
