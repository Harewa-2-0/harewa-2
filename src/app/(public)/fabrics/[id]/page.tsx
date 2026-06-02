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
      <FabricDetail fabricId={id} />
    </div>
  );
}
