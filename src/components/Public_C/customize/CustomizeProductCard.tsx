import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/utils/currency';

export interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    slug?: string;
    category?: string;
}

interface CustomizeProductCardProps {
    product: Product | null | undefined;
}

const GoldRingSpinner: React.FC = () => (
    <div className="w-full flex items-center justify-center py-10">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
);

const CustomizeProductCard: React.FC<CustomizeProductCardProps> = ({
    product,
}) => {
    if (!product || !product._id) {
        return <div className="text-center text-sm text-gray-500 py-6">Nothing in store</div>;
    }

    const imageUrl = product.images?.[0] || '/placeholder.png';
    const displayName = product.name;
    const displayPrice = product.price;

    return (
        <Link href={`/shop/${product._id}/customize`} className="block w-full h-full">
            <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow relative h-full flex flex-col"
                whileHover="hover"
            >
                {/* Price Badge - Top Right */}
                <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                    <span className="text-sm font-bold text-gray-900">
                        {formatPrice(displayPrice)}
                    </span>
                </div>

                {/* Image Container */}
                <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
                    <img
                        src={imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Desktop Light Gold Overlay on Hover (Visible on hover with group-hover) */}
                    <div
                        className="hidden md:flex absolute inset-0 bg-[#D4AF37]/60 backdrop-blur-[2px] items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                    >
                        <div className="bg-white text-black px-6 py-2.5 rounded-full text-center font-bold shadow-xl border-2 border-[#D4AF37] tracking-wider uppercase text-xs transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            Customize
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3">
                        {displayName}
                    </h4>

                    {/* Mobile Customize Button */}
                    <div className="md:hidden mt-auto">
                        <div className="bg-[#D4AF37] text-white py-2 rounded-full text-center text-sm font-semibold shadow-sm active:bg-[#B8962E]">
                            Customize
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default CustomizeProductCard;
