'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, User } from 'lucide-react';
import { easeOut } from 'framer-motion';

interface FashionItem {
  id: number;
  image: string;
  likes: number;
  views: string | number;
  description: string;
}

const TrendingFashionStyles = () => {
  const [activeCategory, setActiveCategory] = useState('Iro & Buba');

  const categories = [
    'Iro & Buba',
    'Aso Oke',
    'Boubou & Kaftan',
    'Ankara Mix and Match',
    'Corset Gowns & Blouses',
    'Two-Piece Outfits',
    'Adire & Kampala',
    'Asoebi Lace',
    'Senator Wear'
  ];

  const fashionItems: { [key: string]: FashionItem[] } = {
    'Iro & Buba': [
      { id: 1, image: 'w1.webp', likes: 234, views: '3.2k', description: 'Traditional Iro & Buba set with intricate embroidery' },
      { id: 2, image: 'w2.webp', likes: 189, views: '2.8k', description: 'Modern twist on classic Iro & Buba design' },
      { id: 3, image: 'w3.webp', likes: 156, views: '2.1k', description: 'Elegant Iro & Buba for special occasions' },
      { id: 4, image: 'w1.webp', likes: 203, views: '2.9k', description: 'Contemporary Iro & Buba styling' },
      { id: 5, image: 'w2.webp', likes: 178, views: '2.4k', description: 'Luxury Iro & Buba collection' },
      { id: 6, image: 'w3.webp', likes: 145, views: '1.9k', description: 'Vintage-inspired Iro & Buba ensemble' }
    ],
    'Aso Oke': [
      { id: 7, image: 'w2.webp', likes: 267, views: '3.5k', description: 'Handwoven Aso Oke with traditional patterns' },
      { id: 8, image: 'w3.webp', likes: 198, views: '2.7k', description: 'Premium Aso Oke fabric styling' },
      { id: 9, image: 'w1.webp', likes: 221, views: '3.1k', description: 'Royal Aso Oke ceremonial wear' },
      { id: 10, image: 'w2.webp', likes: 154, views: '2.3k', description: 'Modern Aso Oke interpretation' },
      { id: 11, image: 'w3.webp', likes: 187, views: '2.6k', description: 'Colorful Aso Oke designs' },
      { id: 12, image: 'w1.webp', likes: 176, views: '2.5k', description: 'Classic Aso Oke weaving techniques' }
    ],
    'Boubou & Kaftan': [
      { id: 13, image: 'w3.webp', likes: 298, views: '4.1k', description: 'Flowing Boubou with elegant draping' },
      { id: 14, image: 'w1.webp', likes: 245, views: '3.4k', description: 'Embroidered Kaftan masterpiece' },
      { id: 15, image: 'w2.webp', likes: 189, views: '2.8k', description: 'Luxury Boubou collection' },
      { id: 16, image: 'w3.webp', likes: 167, views: '2.4k', description: 'Traditional Kaftan styling' },
      { id: 17, image: 'w1.webp', likes: 234, views: '3.2k', description: 'Contemporary Boubou designs' },
      { id: 18, image: 'w2.webp', likes: 201, views: '2.9k', description: 'Artistic Kaftan patterns' }
    ],
    'Ankara Mix and Match': [
      { id: 19, image: 'w1.webp', likes: 312, views: '4.5k', description: 'Creative Ankara mix and match styling' },
      { id: 20, image: 'w3.webp', likes: 278, views: '3.8k', description: 'Bold Ankara pattern combinations' },
      { id: 21, image: 'w2.webp', likes: 195, views: '2.7k', description: 'Trendy Ankara fusion outfits' },
      { id: 22, image: 'w1.webp', likes: 156, views: '2.2k', description: 'Vibrant Ankara coordinated sets' },
      { id: 23, image: 'w3.webp', likes: 223, views: '3.1k', description: 'Modern Ankara interpretations' },
      { id: 24, image: 'w2.webp', likes: 187, views: '2.6k', description: 'Eclectic Ankara style mixing' }
    ],
    'Corset Gowns & Blouses': [
      { id: 25, image: 'w2.webp', likes: 289, views: '3.9k', description: 'Structured corset gown elegance' },
      { id: 26, image: 'w1.webp', likes: 234, views: '3.2k', description: 'Contemporary corset blouse design' },
      { id: 27, image: 'w3.webp', likes: 198, views: '2.8k', description: 'Vintage-inspired corset styling' },
      { id: 28, image: 'w2.webp', likes: 167, views: '2.4k', description: 'Modern corset fashion trends' },
      { id: 29, image: 'w1.webp', likes: 245, views: '3.4k', description: 'Luxury corset collection' },
      { id: 30, image: 'w3.webp', likes: 178, views: '2.5k', description: 'Artistic corset craftsmanship' }
    ],
    'Two-Piece Outfits': [
      { id: 31, image: 'w3.webp', likes: 256, views: '3.6k', description: 'Coordinated two-piece ensemble' },
      { id: 32, image: 'w2.webp', likes: 201, views: '2.9k', description: 'Stylish two-piece combinations' },
      { id: 33, image: 'w1.webp', likes: 189, views: '2.7k', description: 'Trendy two-piece outfits' },
      { id: 34, image: 'w3.webp', likes: 167, views: '2.3k', description: 'Elegant two-piece styling' },
      { id: 35, image: 'w2.webp', likes: 223, views: '3.1k', description: 'Contemporary two-piece designs' },
      { id: 36, image: 'w1.webp', likes: 194, views: '2.8k', description: 'Chic two-piece fashion' }
    ],
    'Adire & Kampala': [
      { id: 37, image: 'w1.webp', likes: 276, views: '3.7k', description: 'Traditional Adire tie-dye artistry' },
      { id: 38, image: 'w3.webp', likes: 234, views: '3.2k', description: 'Kampala fabric sophistication' },
      { id: 39, image: 'w2.webp', likes: 198, views: '2.8k', description: 'Handcrafted Adire patterns' },
      { id: 40, image: 'w1.webp', likes: 167, views: '2.4k', description: 'Modern Kampala interpretations' },
      { id: 41, image: 'w3.webp', likes: 212, views: '3.0k', description: 'Cultural Adire heritage designs' },
      { id: 42, image: 'w2.webp', likes: 185, views: '2.6k', description: 'Contemporary Kampala styling' }
    ],
    'Asoebi Lace': [
      { id: 43, image: 'w2.webp', likes: 298, views: '4.2k', description: 'Luxurious Asoebi lace collection' },
      { id: 44, image: 'w1.webp', likes: 245, views: '3.4k', description: 'Intricate lace work masterpiece' },
      { id: 45, image: 'w3.webp', likes: 201, views: '2.9k', description: 'Elegant Asoebi lace styling' },
      { id: 46, image: 'w2.webp', likes: 178, views: '2.5k', description: 'Premium lace fabric designs' },
      { id: 47, image: 'w1.webp', likes: 234, views: '3.2k', description: 'Sophisticated lace patterns' },
      { id: 48, image: 'w3.webp', likes: 189, views: '2.7k', description: 'Traditional lace craftsmanship' }
    ],
    'Senator Wear': [
      { id: 49, image: 'w3.webp', likes: 267, views: '3.6k', description: 'Distinguished Senator wear styling' },
      { id: 50, image: 'w2.webp', likes: 223, views: '3.1k', description: 'Formal Senator outfit collection' },
      { id: 51, image: 'w1.webp', likes: 198, views: '2.8k', description: 'Classic Senator wear designs' },
      { id: 52, image: 'w3.webp', likes: 156, views: '2.2k', description: 'Contemporary Senator fashion' },
      { id: 53, image: 'w2.webp', likes: 212, views: '3.0k', description: 'Executive Senator wear styles' },
      { id: 54, image: 'w1.webp', likes: 187, views: '2.6k', description: 'Professional Senator attire' }
    ]
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut }
    }
  };

  const formatViews = (views: string | number): string => {
    if (typeof views === 'string') return views;
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto md:px-8 px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          {/* Left: Title and Categories */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-2">
                Trending Fashion Styles
              </h2>
              <img src="/stroke.png" alt="underline" className="h-3" />
            </div>

            {/* Categories */}
            <div className="overflow-x-auto lg:overflow-visible">
              <div className="flex gap-3 lg:flex-col lg:items-start whitespace-nowrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-sm font-medium rounded-full transition-all duration-300
                      ${
                        activeCategory === category
                          ? 'text-[#D4AF37]'
                          : 'text-[#5D5D5D] hover:text-[#D4AF37]'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cards */}
          <div className="lg:flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-x-auto"
              >
                {fashionItems[activeCategory]?.slice(0, 9).map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.description}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        {/* Left: Avatar + Description */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            <User size={12} className="text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-600 font-medium line-clamp-1">
                            {item.description}
                          </span>
                        </div>

                        {/* Right: Likes + Views */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart size={14} className="text-red-500 fill-current" />
                            <span className="text-xs font-medium text-gray-700">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={14} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">
                              {formatViews(item.views)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingFashionStyles;
