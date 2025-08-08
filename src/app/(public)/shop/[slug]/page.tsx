import React from 'react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">Product Details</h1>
      <p className="text-lg text-gray-600">Viewing: <span className="font-mono">{params.slug}</span></p>
    </main>
  );
} 