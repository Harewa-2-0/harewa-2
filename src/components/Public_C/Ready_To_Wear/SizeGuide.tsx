"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SizeData {
  size: string;
  bust: { inches: string; cm: string };
  waist: { inches: string; cm: string };
  hips: { inches: string; cm: string };
  uk: string;
  eu: string;
  aus: string;
}

const sizeData: SizeData[] = [
  {
    size: "XS",
    bust: { inches: "32-33", cm: "81-84" },
    waist: { inches: "24-25", cm: "61-64" },
    hips: { inches: "35-36", cm: "89-91" },
    uk: "2/4",
    eu: "32/34",
    aus: "4/6"
  },
  {
    size: "S",
    bust: { inches: "34-35", cm: "86-89" },
    waist: { inches: "26-27", cm: "66-69" },
    hips: { inches: "37-38", cm: "94-97" },
    uk: "6/8",
    eu: "36/38",
    aus: "8"
  },
  {
    size: "M",
    bust: { inches: "36-37", cm: "91-94" },
    waist: { inches: "28-29", cm: "71-74" },
    hips: { inches: "39-40", cm: "99-102" },
    uk: "10/12",
    eu: "40",
    aus: "10/12"
  },
  {
    size: "L",
    bust: { inches: "38-40", cm: "98-102" },
    waist: { inches: "30-32", cm: "77-81" },
    hips: { inches: "41-43", cm: "105-109" },
    uk: "14",
    eu: "42",
    aus: "14/16"
  },
  {
    size: "XL",
    bust: { inches: "41", cm: "105" },
    waist: { inches: "33", cm: "85" },
    hips: { inches: "44", cm: "113" },
    uk: "16",
    eu: "44",
    aus: "18"
  },
  {
    size: "1X",
    bust: { inches: "44-46", cm: "112-116" },
    waist: { inches: "37-39", cm: "94-98" },
    hips: { inches: "47-48", cm: "119-123" },
    uk: "18",
    eu: "44/46",
    aus: "18/20"
  },
  {
    size: "2X",
    bust: { inches: "47-49", cm: "119-124" },
    waist: { inches: "40-42", cm: "102-107" },
    hips: { inches: "50-52", cm: "127-132" },
    uk: "20/22",
    eu: "48/50",
    aus: "22/24"
  },
  {
    size: "3X",
    bust: { inches: "51-53", cm: "129-135" },
    waist: { inches: "44-46", cm: "112-117" },
    hips: { inches: "54-56", cm: "137-142" },
    uk: "24/26",
    eu: "52/54",
    aus: "26/28"
  }
];

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuide: React.FC<SizeGuideProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('cm');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-20 right-4 lg:right-8 xl:right-12 pointer-events-auto">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 lg:w-96 max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">SIZE GUIDE</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="p-4 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700">Units:</span>
              <div className="flex bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                    unit === 'inches'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  in.
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                    unit === 'cm'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  cm
                </button>
              </div>
            </div>
          </div>

          {/* Size Table */}
          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">Size</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">Bust</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">Waist</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">Hips</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">UK</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">EU</th>
                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-900">AUS</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((row, index) => (
                    <tr key={row.size} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-200 px-2 py-2 font-medium text-gray-900">{row.size}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.bust[unit]}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.waist[unit]}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.hips[unit]}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.uk}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.eu}</td>
                      <td className="border border-gray-200 px-2 py-2 text-gray-700">{row.aus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
