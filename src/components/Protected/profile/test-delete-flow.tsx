'use client';

import React from 'react';
import { useDeleteAccount } from './hooks/use-delete-account';

export default function TestDeleteFlow() {
  const {
    isConfirmOpen,
    isPending,
    error,
    openConfirmDialog,
    closeConfirmDialog,
    handleDeleteAccount,
  } = useDeleteAccount();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Delete Account Flow Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={openConfirmDialog}
          disabled={isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'Test Delete Account'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {isConfirmOpen && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-900 mb-2">Confirmation Dialog Open</h4>
            <p className="text-yellow-700 text-sm mb-3">
              This simulates the inline confirmation UI. In the real component, this would be the ConfirmDialog.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isPending}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Processing...' : 'Confirm Delete'}
              </button>
              <button
                onClick={closeConfirmDialog}
                disabled={isPending}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Test Steps:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Test Delete Account" to open confirmation</li>
            <li>Click "Confirm Delete" to test the flow</li>
            <li>Check browser console for any errors</li>
            <li>Verify redirect to home page after success</li>
            <li>Try going back - should be blocked by middleware</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
