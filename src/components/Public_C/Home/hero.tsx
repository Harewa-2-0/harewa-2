"use client"
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col items-center justify-center min-h-[80vh] relative">
          {/* Text Section */}
          <div className="text-center mb-10 md:mb-6">
            <motion.h1
              className="text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight"
              variants={textVariants}
            >
              Where Innovation
              <br />
              Meets Fashion
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={textVariants}
              style={{ color: '#5D5D5D' }}
            >
              Your premier destination where cutting-edge technology meets the vibrant world of fashion.
            </motion.p>

            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200"
              style={{
                backgroundColor: '#FFE181',
                border: '2px solid #FDC713',
                color: 'black'
              }}
              variants={ctaVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Customise your fabric
              <ArrowRight size={20} />
            </motion.button>
          </div>

          {/* Images Layout */}
          <div className="relative w-full flex justify-center items-center -mt-10 h-[350px] max-h-[60vh]">
            {/* Left Image */}
            <motion.div
              className="absolute left-[11%] top-[-20px] z-10"
              variants={imageVariants}
              style={{
                width: '250px',
                height: '200px'
              }}
            >
              <img
                src="h1.webp"
                alt="Fashion Left"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Center Image - rounded and pushed down */}
            <motion.div
              className="z-20 relative"
              variants={imageVariants}
              style={{
                width: '550px',
                height: '320px',
                marginTop: '60px'
              }}
            >
              <img
                src="h2.webp"
                alt="Fashion Center"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="absolute right-[11%] top-[-20px] z-10"
              variants={imageVariants}
              style={{
                width: '250px',
                height: '200px'
              }}
            >
              <img
                src="h3.webp"
                alt="Fashion Right"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="text-center">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              variants={textVariants}
            >
              Where Innovation
              <br />
              Meets Fashion
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg text-gray-600 mb-8 px-4"
              variants={textVariants}
              style={{ color: '#5D5D5D' }}
            >
              Your premier destination where cutting-edge technology meets the vibrant world of fashion.
            </motion.p>

            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium mb-8 transition-all duration-200"
              style={{
                backgroundColor: '#FFE181',
                border: '2px solid #FDC713',
                color: 'black'
              }}
              variants={ctaVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Customise your fabric
              <ArrowRight size={20} />
            </motion.button>

            {/* Mobile Image */}
            <motion.div
              className="flex justify-center"
              variants={imageVariants}
            >
              <div className="w-80 h-96 sm:w-96 sm:h-[480px]">
                <img
                  src="h2.webp"
                  alt="Fashion Mobile"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
