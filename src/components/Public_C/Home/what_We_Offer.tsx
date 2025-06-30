import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Define the Card type
interface Card {
  id: number;
  title: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
}

const What_we_Offer = () => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const openModal = (card: Card) => {
    setSelectedCard(card);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedCard) {
      setCurrentImageIndex((prev: number) =>
        prev === selectedCard.galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedCard) {
      setCurrentImageIndex((prev: number) =>
        prev === 0 ? selectedCard.galleryImages.length - 1 : prev - 1
      );
    }
  };

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
                className="flex-shrink-0 w-80 md:w-96 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={() => openModal(card)}
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

      {/* Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-center items-center p-6 border-b relative">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedCard.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="absolute right-6 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-lg cursor-pointer"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row">
                {/* Image Gallery */}
                <div className="lg:w-2/3 relative">
                  <div className="relative h-64 md:h-96 lg:h-[500px]">
                    <img
                      src={selectedCard.galleryImages[currentImageIndex]}
                      alt={`${selectedCard.title} ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <ChevronLeft size={20} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <ChevronRight size={20} className="text-gray-800" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      {currentImageIndex + 1} / {selectedCard.galleryImages.length}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  <div className="flex gap-3 p-6 overflow-x-auto">
                    {selectedCard.galleryImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                          currentImageIndex === index 
                            ? 'border-yellow-400 opacity-100 scale-105 shadow-lg' 
                            : 'border-gray-300 opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/3 p-6">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {selectedCard.description}
                  </p>
                  
                  <motion.button
                    className="w-full py-3 px-6 rounded-full font-medium transition-all duration-200"
                    style={{
                      backgroundColor: '#FFE181',
                      border: '2px solid #FDC713',
                      color: 'black'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore More
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default What_we_Offer;