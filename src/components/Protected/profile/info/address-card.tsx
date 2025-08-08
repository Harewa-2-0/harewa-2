'use client';

import { Pencil } from 'lucide-react';

export type AddressValues = {
  fullName?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export default function AddressCard({
  title,
  address,
  onEdit,
}: {
  title: string;
  address?: AddressValues;
  onEdit: () => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <button onClick={onEdit} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 inline-flex items-center gap-1">
          <Pencil size={14} /> Edit
        </button>
      </div>
      {address?.address1 ? (
        <div className="text-sm text-gray-700">
          {address.fullName && <div>{address.fullName}</div>}
          {address.phone && <div>{address.phone}</div>}
          <div>{address.address1}{address.address2 ? `, ${address.address2}` : ''}</div>
          <div>{address.city} {address.state}</div>
          <div>{address.country} {address.postalCode}</div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No address set.</p>
      )}
    </div>
  );
}
