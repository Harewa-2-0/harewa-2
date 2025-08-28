'use client';

import { Pencil } from 'lucide-react';
import type { ProfileAddress } from '@/store/profile-store';

export type AddressValues = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export default function AddressCard({
  title,
  address,
  onEdit,
}: {
  title: string;
  address?: ProfileAddress;
  onEdit: () => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-black">{title}</h4>
        <button 
          onClick={onEdit} 
          className="px-3 py-1.5 cursor-pointer text-sm border rounded-lg inline-flex items-center gap-1 bg-[#fdc713] text-black hover:bg-[#f0c000]"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
      {address?.line1 ? (
        <div className="text-sm text-black">
          <div className="font-medium">{address.line1}</div>
          <div>{address.city}, {address.state} {address.zip}</div>
          <div>{address.country}</div>
          {address.isDefault && (
            <span className="inline-block px-2 py-1 bg-[#fdc713] text-black text-xs rounded-full mt-2">
              Default
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No address set.</p>
      )}
    </div>
  );
}
