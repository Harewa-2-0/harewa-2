'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useDeleteAccount } from './hooks/use-delete-account';

export default function DeleteAccountSection() {
  const [confirmationText, setConfirmationText] = useState('');
  const {
    isPending,
    error,
    handleDeleteAccount,
  } = useDeleteAccount();

  const canDelete = confirmationText === 'DELETE';

  const handleDelete = () => {
    if (canDelete) {
      handleDeleteAccount();
    }
  };

  return (
    <div className="bg-white md:m-6 md:rounded-lg md:border">
      {/* Header */}
      <div className="p-4 md:p-6 border-b">
        <h2 className="text-lg font-semibold text-black">Delete your account</h2>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-red-900">This action cannot be undone</h3>
            <p className="text-red-700 text-sm">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="text-red-700 text-sm list-disc list-inside space-y-1 ml-2">
              <li>Order history and preferences</li>
              <li>Saved addresses and payment methods</li>
              <li>Wishlist items</li>
              <li>Account settings and profile information</li>
            </ul>
          </div>
        </div>

        {/* Final Confirmation */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Final Confirmation</h4>
          <p className="text-gray-700 text-sm mb-4">
            To confirm account deletion, please type <strong>DELETE</strong> in the field below and click the delete button.
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                confirmationText === 'DELETE' 
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                  : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
              }`}
              id="delete-confirmation"
              aria-describedby="confirmation-help"
            />
            
            <p 
              id="confirmation-help" 
              className={`text-sm ${
                confirmationText === 'DELETE' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {confirmationText === 'DELETE' 
                ? '✓ Confirmation text matches. You can now delete your account.' 
                : 'Type exactly "DELETE" to enable the delete button.'
              }
            </p>
            
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending || !canDelete}
                aria-disabled={isPending || !canDelete}
                className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  canDelete 
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                } ${isPending ? 'opacity-50' : ''}`}
              >
                {isPending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="inline-block w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.history.back()}
                disabled={isPending}
                className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
