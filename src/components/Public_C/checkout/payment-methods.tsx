'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PaymentMethodsProps {
  isEnabled: boolean;
}

export default function PaymentMethods({ isEnabled }: PaymentMethodsProps) {
  const [cardDetails, setCardDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    saveCard: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Payment logic will be implemented later
    console.log('Payment submitted:', cardDetails);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment method</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          All transactions are secured & encrypted
        </p>
        
        <div className="flex justify-start items-start gap-3">
          <Image src="/mastercard.svg" alt="Mastercard" width={40} height={30} />
          <Image src="/interswitch.svg" alt="Interswitch" width={65} height={35} />
          <Image src="/paystack.svg" alt="Paystack" width={65} height={35} />
          <Image src="/visa.svg" alt="Visa" width={40} height={30} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            name="cardName"
            value={cardDetails.cardName}
            onChange={handleInputChange}
            disabled={!isEnabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter cardholder name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            disabled={!isEnabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="1234 5678 9012 3456"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={handleInputChange}
              disabled={!isEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Code
            </label>
            <input
              type="text"
              name="securityCode"
              value={cardDetails.securityCode}
              onChange={handleInputChange}
              disabled={!isEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="CVC"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveCard"
            name="saveCard"
            checked={cardDetails.saveCard}
            onChange={handleInputChange}
            disabled={!isEnabled}
            className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37] disabled:opacity-50"
          />
          <label htmlFor="saveCard" className="text-sm text-gray-700">
            Save my card details
          </label>
        </div>

        <button
          type="submit"
          disabled={!isEnabled}
          className="w-full py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          PAY NOW
        </button>
      </form>
    </div>
  );
}
