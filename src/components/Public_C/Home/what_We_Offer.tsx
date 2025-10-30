"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define the Card type
interface Card {
  id: number;
  title: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
}

const What_we_Offer = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Sample data - you can replace with your actual data
  const cards: Card[] = [
    {
      id: 1,
      title: "Trending Fashion Insights",
      description: "Stay ahead of the curve with our expertly curated sections showcasing the latest and emerging fashion trends. Like what you see? Save your favorite trends for future reference!",
      mainImage: "w1.webp",
      galleryImages: ["w1.webp", "w2.webp", "w3.webp", "w1.webp"]
    },
    {
      id: 2,
      title: "Ready-to-Wear Apparel Marketplace",
      description: "Browse our extensive online store featuring a diverse collection of ready-to-wear clothing for every occasion, ensuring to make the perfect choice.",
      mainImage: "w2.webp",
      galleryImages: ["w2.webp", "w1.webp", "w3.webp", "w2.webp"]
    },
    {
      id: 3,
      title: "AI-Powered Style Generator",
      description: "Unleash your inner stylist with our revolutionary AI Chat for Fashion Style Generation. Receive personalized fashion recommendations based on specific requirements.",
      mainImage: "w3.webp",
      galleryImages: ["w3.webp", "w2.webp", "w1.webp", "w3.webp"]
    },
    {
      id: 4,
      title: "Fabric & Accessories Hub",
      description: "Explore our comprehensive collection of premium fabrics and accessories. All you need to create stunning outfits that match what you need.",
      mainImage: "w1.webp",
      galleryImages: ["w1.webp", "w3.webp", "w2.webp", "w1.webp"]
    },
    {
      id: 5,
      title: "Custom Design Studio",
      description: "Create unique fashion pieces with our state-of-the-art design tools. From concept to creation, bring your fashion vision to life.",
      mainImage: "w2.webp",
      galleryImages: ["w2.webp", "w3.webp", "w1.webp", "w2.webp"]
    },
    {
      id: 6,
      title: "Fashion Trend Analytics",
      description: "Discover emerging trends and market insights with our advanced analytics platform. Stay ahead of the fashion curve with data-driven insights.",
      mainImage: "w3.webp",
      galleryImages: ["w3.webp", "w1.webp", "w2.webp", "w3.webp"]
    }
  ];

  // Duplicate cards for infinite scrolling
  const infiniteCards: Card[] = [...cards, ...cards, ...cards];


  return (
    <>
      {/* Main Section */}
      <section className="w-full bg-white py-16 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What We Offer
          </h2>
          <p className="text-lg text-gray-600">
            Trending Fashion Styles
          </p>
        </div>

        {/* Sliding Cards Container */}
        <div className="relative w-full">
          <motion.div
            className="flex gap-6 w-fit"
            animate={
              isPaused
                ? {}
                : { x: [0, -2304] } // Adjusted for 6 cards (6 * 384px card width)
            }
            transition={
              isPaused
                ? undefined
                : {
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 35,
                      ease: "linear"
                    }
                  }
            }
            style={{ width: 'fit-content' }}
          >
            {infiniteCards.map((card: Card, index: number) => (
              <motion.div
                key={`${card.id}-${index}`}
                className="flex-shrink-0 w-80 md:w-96 bg-white rounded-2xl shadow-lg overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="h-64 md:h-80 overflow-hidden">
                  <img
                    src={card.mainImage}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </>
  );
};

export default What_we_Offer;