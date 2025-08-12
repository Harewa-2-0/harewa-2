"use client"
import React from 'react';
import { motion, Variants, Easing } from 'framer-motion';

interface CardData {
  id: number;
  icon: string;
  title: string;
  paragraph: string;
  bgColor: string;
  textColor: string;
}

const FashionCardsComponent: React.FC = () => {
  const cardsData: CardData[] = [
    {
      id: 1,
      icon: 'plan.png',
      title: 'For Event Planners & Style Seekers',
      paragraph: 'Planning an event or simply looking for the perfect outfit? Discover our Trending Fashion section for inspiration tailored to any occasion. Easily find ready-to-wear pieces that match the vibe you\'re aiming for, and explore our marketplace with confidence, knowing you\'re choosing from reliable suppliers.',
      bgColor: '#FFF4CE',
      textColor: '#5D5D5D'
    },
    {
      id: 2,
      icon: 'thread.png',
      title: 'For Fashion Designers & Innovators',
      paragraph: 'Uncover insights into customer wants and showcase your unique vision. Our Fabric & Accessory Repository provides a wealth of resources, while the AI Style Generator can spark new ideas. Plus, you can connect with a broader audience and receive valuable feedback through our platform.',
      bgColor: '#3B3A36',
      textColor: '#FFFFFF'
    },
    {
      id: 3,
      icon: 'fashion.png',
      title: 'For Everyone Who Loves Fashion',
      paragraph: 'Whether you\'re shopping for a special event, updating your everyday look, or just exploring the exciting world of fashion, Fashion Forward is your go-to resource. Find what you love, get inspired, and express yourself with confidence.',
      bgColor: '#3B3A36',
      textColor: '#FFFFFF'
    },
    {
      id: 4,
      icon: 'supplier.png',
      title: 'For Suppliers & Retailers',
      paragraph: 'Connect with potential customers and showcase your products to a targeted audience. Our platform provides tools to help you reach fashion enthusiasts, designers, and event planners who are actively seeking quality suppliers and unique pieces.',
      bgColor: '#FFF4CE',
      textColor: '#5D5D5D'
    }
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const cardVariants: Variants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as Easing
      }
    }
  };

  return (
    <div className="w-full bg-white py-16 p-4 md:p-8 md:pb-24">
        <div className='py-12 flex flex-col items-center justify-center'>
              <h2 className="text-3xl md:w-[35%] md:text-4xl text-[#000000] text-center font-bold mb-2">
              Your Fashion Journey Starts Here
              </h2>
              <p className='text-center text-[#5D5D5D]'>
              We provide value for a broad range of users
              </p>
            </div>
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cardsData.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              className="rounded-2xl p-8 shadow-sm border border-gray-100"
              style={{ 
                backgroundColor: card.bgColor,
                color: card.textColor 
              }}
            >
              <div className="flex flex-col items-start space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <img 
                    src={card.icon} 
                    alt={card.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-black leading-tight">
                  {card.title}
                </h3>
                
                {/* Paragraph */}
                <p className="text-sm leading-relaxed opacity-90">
                  {card.paragraph}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FashionCardsComponent;