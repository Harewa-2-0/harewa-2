'use client';
import React, { useState } from 'react';
import { Package, Activity, Heart, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock menu items (replace with your actual menuItems import)
const menuItems = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'activity', label: 'Activity Feed', icon: Activity },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'My Info', icon: User },
  { id: 'logout', label: 'Sign Out', icon: LogOut, isLogout: true }
];

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MobileNavigation({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: Props) {

  return (
    <div className="md:hidden bg-white">
      {/* Horizontal Scrollable Navigation */}
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 space-x-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors duration-200 relative
                  ${activeTab === item.id 
                    ? 'text-gray-800 font-medium' 
                    : item.isLogout 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {/* Active tab background */}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-yellow-100"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Active border bottom */}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeBorder"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-yellow-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Content - always visible, z-index ensures it stays on top */}
                <div className="relative z-10 flex items-center gap-2">
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}