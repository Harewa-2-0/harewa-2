"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

type HeroCtaVariant = "dark" | "gold";

function HeroCtaButton({
  label,
  href,
  variant,
  className = "",
}: {
  label: string;
  href: string;
  variant: HeroCtaVariant;
  className?: string;
}) {
  const router = useRouter();

  const buttonVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: { transition: { staggerChildren: 0.05 } },
    tap: { scale: 0.98 },
  };

  const arrowVariants: Variants = {
    hidden: { x: 0, y: 0, opacity: 0.85 },
    visible: { x: 0, y: 0, opacity: 0.85 },
    hover: {
      x: 4,
      y: -4,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const isDark = variant === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => router.push(href)}
      className={`group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden px-6 py-3 rounded-full font-medium ${className} ${
        isDark
          ? "bg-white text-black border-2 border-black"
          : "text-black border-2 border-[#FDC713]"
      }`}
      style={
        isDark
          ? undefined
          : {
              backgroundColor: "#FFE181",
            }
      }
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Container hover fill */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-full scale-0 transition-transform duration-300 ease-out group-hover:scale-100 ${
          isDark ? "bg-black" : "bg-[#FDC713]/35"
        }`}
      />

      {/* Subtle upper-right corner highlight on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-6 -right-6 h-12 w-12 rounded-full opacity-0 blur-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 ${
          isDark ? "bg-white/20" : "bg-[#FDC713]/50"
        }`}
      />

      <span
        className={`relative z-10 transition-colors duration-300 ${
          isDark ? "group-hover:text-white" : ""
        }`}
      >
        {label}
      </span>
      <motion.span
        className={`relative z-10 flex shrink-0 transition-colors duration-300 ${
          isDark ? "group-hover:text-white" : ""
        }`}
        variants={arrowVariants}
      >
        <ArrowUpRight size={20} strokeWidth={2.25} />
      </motion.span>
    </motion.button>
  );
}

const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 overflow-hidden pt-24 md:pt-28">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col items-center justify-center min-h-[80vh] relative">
          {/* Text Section */}
          <div className="text-center mb-0">
            <motion.h1
              className="text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-[1]"
              variants={textVariants}
            >
              Where Innovation
              <br />
              Meets Fashion
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
              variants={textVariants}
              style={{ color: "#5D5D5D" }}
            >
              Your premier destination where cutting-edge
              <br />
              technology meets the vibrant world of fashion.
            </motion.p>

            <motion.div
              className="flex flex-row items-center justify-center gap-4 mt-2"
              variants={textVariants}
            >
              <HeroCtaButton label="Shop fabrics" href="/fabrics" variant="dark" />
              <HeroCtaButton label="Customise your fabric" href="/customize" variant="gold" />
            </motion.div>
          </div>

          {/* Images Layout */}
          <div className="relative w-full flex justify-center items-center -mt-8 h-[420px] max-h-[68vh]">
            {/* Left Image — tucked up toward CTAs */}
            <motion.div
              className="absolute left-[5%] xl:left-[6%] -top-2 xl:top-0 z-10"
              variants={imageVariants}
              style={{ width: "300px", height: "240px" }}
            >
              <img
                src="h1.webp"
                alt="Fashion Left"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Center Image */}
            <motion.div
              className="z-20 relative"
              variants={imageVariants}
              style={{ width: "550px", height: "320px", marginTop: "36px" }}
            >
              <img
                src="h2.webp"
                alt="Fashion Center"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="absolute right-[5%] xl:right-[6%] -top-2 xl:top-0 z-10"
              variants={imageVariants}
              style={{ width: "300px", height: "240px" }}
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
              className="text-base sm:text-lg text-gray-600 mb-8 px-4 leading-relaxed"
              variants={textVariants}
              style={{ color: "#5D5D5D" }}
            >
              Your premier destination where cutting-edge technology meets the vibrant world of fashion.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 px-4"
              variants={textVariants}
            >
              <HeroCtaButton
                label="Shop fabrics"
                href="/fabrics"
                variant="dark"
                className="w-full sm:w-auto justify-center"
              />
              <HeroCtaButton
                label="Customise your fabric"
                href="/customize"
                variant="gold"
                className="w-full sm:w-auto justify-center"
              />
            </motion.div>
            {/* Mobile Image */}
            <motion.div className="flex justify-center" variants={imageVariants}>
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
