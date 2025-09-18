'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { Category } from './CategoriesTable';
import { updateCategory } from '@/services/product-category';
import { generateSlug } from './utils';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category; // should include: _id (string), id? (slug), name, description, productCount?
  onSuccess?: (updatedCategory: Category) => void;
}

export default function EditCategoryModal({ isOpen, onClose, category, onSuccess }: EditCategoryModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        name: category.name ?? '',
        description: category.description ?? '',
      });
    }
  }, [isOpen, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
    if (!category?._id) {
      addToast('Missing category identifier (_id).', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Backend requires body: { id: <slug>, name, description }
      // Prefer existing category.id (slug); if missing/empty, generate from (possibly edited) name.
      let slug = (category as any).id; // backend field holding the slug
      if (!slug || typeof slug !== 'string' || !slug.trim()) {
        slug = generateSlug ? generateSlug(name) : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        slug = slug || 'unnamed';
      }

      const payload = {
        id: slug,
        name,
        description,
      };

      // URL must carry _id (ObjectId), NOT the slug
      const result = await updateCategory(category._id, payload);
      console.log('Category updated successfully:', result);
      addToast('Category updated successfully!', 'success');

      const updatedCategory: Category = {
        ...category,
        // Preserve the original _id and slug
        _id: category._id,
        slug: category.slug,
        name,
        description,
        updatedAt: new Date().toISOString(),
      };

      onSuccess?.(updatedCategory);
      onClose();
    } catch (error: any) {
      console.error('Error updating category:', error);
      
      // Handle different types of errors with user-friendly messages
      let errorMessage = 'Failed to update category. Please try again.';
      
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        errorMessage = 'Request failed. Please check your network connection and try again.';
      } else if (error?.error?.includes('E11000') || error?.message?.includes('duplicate')) {
        errorMessage = 'A category with this name already exists. Please choose a different name.';
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message && !error.message.includes('aborted')) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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
      aria-labelledby="edit-category-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="edit-category-modal-title" className="text-xl font-semibold text-gray-900">
              Edit Category
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

            {/* Product Count (Read-only) */}
            <div>
              <label htmlFor="productCount" className="block text-sm font-medium text-gray-700 mb-1">
                Product Count
              </label>
              <input
                type="number"
                id="productCount"
                name="productCount"
                value={Number(category?.productCount ?? 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">This field is automatically calculated</p>
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
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isLoading ? 'Updating...' : 'Update Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
