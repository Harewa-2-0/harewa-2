import React from 'react';
import Link from 'next/link';

interface ProductBreadcrumbProps {
  productName: string;
  gender?: string;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ productName, gender }) => {
  return (
    <div className="max-w-7xl hidden md:block pt-20 mx-auto px-4 sm:px-6 lg:px-8  pb-8">
      <nav className="flex text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/shop" className="hover:underline">Ready to wear</Link>
        <span className="mx-2">›</span>
        <span>{gender || 'All'}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{productName}</span>
      </nav>
    </div>
  );
};

export default ProductBreadcrumb; 