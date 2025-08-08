'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { AddressValues } from './address-card';

export default function AddressModal({
  open, title, initial, onClose, onSubmit
}: {
  open: boolean;
  title: string;
  initial?: AddressValues;
  onClose: () => void;
  onSubmit: (v: AddressValues) => Promise<void>;
}) {
  const { register, handleSubmit, reset } = useForm<AddressValues>({ defaultValues: initial });

  // sync when initial changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => reset(initial), [initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(async (v) => { await onSubmit(v); onClose(); })}
          className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Full name</label>
            <input {...register('fullName')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input {...register('phone')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Address line 1</label>
            <input {...register('address1', { required: true })} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Address line 2</label>
            <input {...register('address2')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">City</label>
            <input {...register('city')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">State/Region</label>
            <input {...register('state')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Country</label>
            <input {...register('country')} className="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Postal code</label>
            <input {...register('postalCode')} className="w-full border rounded-lg px-3 py-2"/>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#bfa129]">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
