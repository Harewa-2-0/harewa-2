import React from 'react';

export default function CategoryHeader({ subtext }: { subtext?: string }) {
  return (
    <div className="py-6 text-center">
      <h2 className="text-3xl font-bold mb-1">Ready to Wear</h2>
      {subtext && <p className="text-gray-500">{subtext}</p>}
    </div>
  );
} 