'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import type { ProfileAddress } from '@/store/profile-store';

export type AddressValues = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export default function AddressModal({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial?: AddressValues;
  onClose: () => void;
  onSubmit: (data: AddressValues) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<AddressValues>();

  useEffect(() => {
    if (open && initial) {
      reset(initial);
    } else if (open) {
      reset({
        line1: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isDefault: false
      });
    }
  }, [open, initial, reset]);

  const handleFormSubmit = async (data: AddressValues) => {
    setSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              {...register('line1', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              {...register('city', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              placeholder="Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              {...register('state', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              placeholder="Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              {...register('zip')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              placeholder="100001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              {...register('country', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc713] focus:border-transparent text-black"
              placeholder="Nigeria"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="w-4 h-4 text-[#fdc713] border-gray-300 rounded focus:ring-[#fdc713]"
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="flex-1 px-4 py-2 bg-[#fdc713] text-black rounded-lg hover:bg-[#f0c000] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2 inline" size={16} />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
