import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  size: string;
  quantity: number;
  image: string;
}

interface CartUIProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const CartUI = ({ isOpen = true, setIsOpen }: CartUIProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: '(name of outfit) Lorem ipsum dolor sit amet consectetur...',
      price: 12000,
      originalPrice: 21000,
      size: 'M',
      quantity: 2,
      image: 'cart_1'
    },
    {
      id: '2',
      name: '(name of outfit) Lorem ipsum dolor sit amet consectetur...',
      price: 12000,
      originalPrice: 21000,
      size: 'M',
      quantity: 2,
      image: 'cart_2'
    }
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      {/* Slight overlay for click outside (optional, can be removed if not wanted) */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }} />
      <div className="bg-white rounded-lg shadow-2xl border max-w-md w-96 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">MY CART</h2>
          <button
            onClick={() => setIsOpen ? setIsOpen(false) : null}
            className="p-1 rounded-full border border-[#CCCCCC] transition-colors duration-200 group cursor-pointer"
            style={{ outline: 'none' }}
          >
            <X size={20} className="text-[#CCCCCC] group-hover:text-white transition-colors duration-200" />
          </button>
          <style jsx>{`
            .group:hover {
              background: #D4AF37;
              border-color: transparent;
            }
          `}</style>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-100">
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={`/${item.image}.webp`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2 leading-tight">
                    {item.name}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500 font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    Size: <span className="font-medium">{item.size}</span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    
                    <span className="font-medium text-gray-900 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-bold text-black text-lg">{formatPrice(subtotal)}</span>
            </div>
            <span className="text-red-500 text-sm">You save {formatPrice(totalSavings)}</span>
          </div>
          {/* Action Buttons */}
          <div className="mt-2">
            <button className="w-full py-3 rounded-lg font-medium text-white transition-colors cursor-pointer" style={{ background: '#D4AF37' }}>
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartUI;