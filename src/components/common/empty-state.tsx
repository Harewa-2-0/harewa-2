'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  title: string;        // e.g., "Your wishlist is empty"
  description: string;  // e.g., "You don’t have any product in the wishlist yet."
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/shop'); // change to your actual store page route
  };

  return (
    <div className="bg-white rounded-lg border p-8 text-center max-w-md mx-auto">
      {/* Image */}
      <div className="flex justify-center mb-6">
        <Image
          src="/empty.webp" // fixed empty image
          alt="Empty state"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-2 text-black">{title}</h2>

      {/* Description */}
      <p className="mb-6 text-black">{description}</p>

      {/* Fixed Button */}
      <button
        onClick={handleRedirect}
        className="px-6 py-3 bg-[#D4AF37] hover:bg-[#bfa129] cursor-pointer text-white rounded-lg font-medium transition-colors"
      >
        RETURN TO SHOP
      </button>
    </div>
  );
}
