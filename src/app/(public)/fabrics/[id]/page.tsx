'use client';

import FabricDetail from '@/components/Public_C/fabrics_gallery/FabricDetail';
import { use } from 'react';

export default function FabricDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-white shadow-sm border-b border-gray-100 mb-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-sm font-medium text-[#B8941F] uppercase tracking-wide">
            Fabric shop
          </h2>
        </div>
      </div>
      <FabricDetail fabricId={id} />
    </div>
  );
}
