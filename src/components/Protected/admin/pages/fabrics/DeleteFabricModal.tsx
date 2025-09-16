'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { type Fabric } from './FabricsTable';

interface DeleteFabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric;
  onSuccess?: (fabricId: string) => void;
}

export default function DeleteFabricModal({ isOpen, onClose, fabric, onSuccess }: DeleteFabricModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => { if (isOpen) setError(null); }, [isOpen]);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!fabric?._id) throw new Error('Missing fabric identifier (_id).');
      // UI-only: simulate success
      addToast('Fabric deleted (UI only).', 'success');
      onSuccess?.(fabric._id);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete fabric. Please try again.';
      setError(String(msg));
      addToast(String(msg), 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
      aria-labelledby="delete-fabric-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="delete-fabric-modal-title" className="text-xl font-semibold text-gray-900">Delete Fabric</h2>
            <button onClick={onClose} disabled={isLoading} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure you want to delete this fabric?</h3>
              <p className="text-sm text-gray-600 mb-4">This action cannot be undone. The fabric <strong>"{fabric?.name ?? ''}"</strong> will be permanently removed.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={handleDelete} disabled={isLoading} className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isLoading ? 'Deleting...' : 'Delete Fabric'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


