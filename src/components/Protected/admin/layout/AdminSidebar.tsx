'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <img src="/dashboard.png" alt="Dashboard" className="w-5 h-5 transition-all duration-200" />
    ),
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: (
      <img src="/products.png" alt="Products" className="w-5 h-5 transition-all duration-200" />
    ),
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: (
      <img src="/elements.png" alt="Orders" className="w-5 h-5 transition-all duration-200" />
    ),
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Fabrics',
    href: '/admin/fabrics',
    icon: (
      <img src="/Subtract.png" alt="Fabrics" className="w-5 h-5 transition-all duration-200" />
    ),
  },
  {
    name: 'Deliveries',
    href: '/admin/deliveries',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-black">
          <div className="flex items-center w-full">
            {/* HAREWA Logo */}
            <img src="/logo.webp" alt="HAREWA Logo" className="w-full h-12 rounded-lg object-contain" />
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {/* Greeting */}
      <div className="px-6 py-4">
        <p className="text-sm text-gray-600">Hello Admin</p>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37]/20 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                    {item.name === 'Dashboard' || item.name === 'Products' || item.name === 'Orders' || item.name === 'Fabrics' ? (
                      <div className={`w-5 h-5 ${isActive ? 'brightness-0 saturate-100' : 'brightness-0 saturate-100 opacity-60'}`} 
                           style={{ 
                             filter: isActive 
                               ? 'brightness(0) saturate(100%) invert(67%) sepia(95%) saturate(7500%) hue-rotate(45deg) brightness(102%) contrast(101%)' 
                               : 'brightness(0) saturate(100%) invert(40%) sepia(8%) saturate(1070%) hue-rotate(202deg) brightness(95%) contrast(86%)'
                           }}>
                        {item.icon}
                      </div>
                    ) : (
                      item.icon
                    )}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}
