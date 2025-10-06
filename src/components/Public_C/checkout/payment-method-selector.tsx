'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PaymentMethodSelectorProps {
  isEnabled: boolean;
  onPaymentMethodSelect?: (method: 'paystack' | 'stripe') => void;
}

export default function PaymentMethodSelector({ 
  isEnabled, 
  onPaymentMethodSelect 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'paystack' | 'stripe' | null>(null);

  const handleMethodSelect = (method: 'paystack' | 'stripe') => {
    if (!isEnabled) return;
    
    setSelectedMethod(method);
    onPaymentMethodSelect?.(method);
    
    // For now, just log the selection - payment automation will be implemented later
    console.log(`Selected payment method: ${method}`);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Choose Payment method
        </h2>
        <p className="text-gray-600">
          All transactions are secured & encrypted
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        {/* Paystack Image */}
        <div className="relative">
          <Image 
            src="/paystack.png" 
            alt="Paystack" 
            width={200} 
            height={120}
            onClick={() => handleMethodSelect('paystack')}
            className={`
              cursor-pointer transition-all duration-200 rounded-lg border-2 p-4
              ${selectedMethod === 'paystack' 
                ? 'border-blue-500 shadow-lg' 
                : 'border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-105'
              }
              ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {/* Selection indicator */}
          {selectedMethod === 'paystack' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Stripe Image */}
        <div className="relative">
          <Image 
            src="/stripe.png" 
            alt="Stripe" 
            width={200} 
            height={120}
            onClick={() => handleMethodSelect('stripe')}
            className={`
              cursor-pointer transition-all duration-200 rounded-lg border-2 p-4
              ${selectedMethod === 'stripe' 
                ? 'border-purple-500 shadow-lg' 
                : 'border-purple-200 hover:border-purple-300 hover:shadow-md hover:scale-105'
              }
              ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {/* Selection indicator */}
          {selectedMethod === 'stripe' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Payment Button */}
      {selectedMethod && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // Payment automation will be implemented here
              console.log(`Processing payment with ${selectedMethod}`);
            }}
            className="px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors"
          >
            PAY WITH {selectedMethod.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}
