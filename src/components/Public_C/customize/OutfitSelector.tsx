import React, { useState } from 'react';
import Image from 'next/image';

interface OutfitSelectorProps {
  selectedOutfit: string;
  selectedOutfitOption: string;
  onOutfitSelect: (outfit: string, option: string) => void;
  gender?: string;
}

interface OutfitOption {
  value: string;
  label: string;
  image: string;
  subOptions: {
    value: string;
    label: string;
  }[];
}

const outfitOptions: OutfitOption[] = [
  {
    value: 'gown',
    label: 'Gown',
    image: '/gown.png',
    subOptions: [
      { value: 'floor-length-gown', label: 'Floor Length Gown' },
      { value: 'midi-gown', label: 'Midi Gown' },
      { value: 'short-gown', label: 'Short Gown' },
      { value: 'mermaid-gown', label: 'Mermaid Gown' },
      { value: 'a-line-gown', label: 'A-Line Gown' },
      { value: 'ball-gown', label: 'Ball Gown' },
    ]
  },
  {
    value: 'skirt',
    label: 'Skirt',
    image: '/skirt.png',
    subOptions: [
      { value: 'pencil-skirt', label: 'Pencil Skirt' },
      { value: 'a-line-skirt', label: 'A-Line Skirt' },
      { value: 'maxi-skirt', label: 'Maxi Skirt' },
      { value: 'mini-skirt', label: 'Mini Skirt' },
      { value: 'wrap-skirt', label: 'Wrap Skirt' },
      { value: 'pleated-skirt', label: 'Pleated Skirt' },
    ]
  },
  {
    value: 'blouse',
    label: 'Top',
    image: '/sleve.png',
    subOptions: [
      { value: 'fitted-blouse', label: 'Fitted Top' },
      { value: 'loose-blouse', label: 'Loose Top' },
      { value: 'crop-blouse', label: 'Crop Top' },
      { value: 'wrap-blouse', label: 'Wrap Top' },
      { value: 'peplum-blouse', label: 'Peplum Top' },
      { value: 'tunic-blouse', label: 'Tunic Top' },
    ]
  },
  {
    value: 'pants',
    label: 'Pants',
    image: '/pants.png',
    subOptions: [
      { value: 'wide-leg-pants', label: 'Wide Leg Pants' },
      { value: 'straight-pants', label: 'Straight Pants' },
      { value: 'tapered-pants', label: 'Tapered Pants' },
      { value: 'cargo-pants', label: 'Cargo Pants' },
      { value: 'palazzo-pants', label: 'Palazzo Pants' },
      { value: 'trouser-pants', label: 'Trouser Pants' },
    ]
  },
  {
    value: 'sleeve',
    label: 'Sleeve',
    image: '/sleve.png',
    subOptions: [
      { value: 'long-sleeve', label: 'Long Sleeve' },
      { value: 'short-sleeve', label: 'Short Sleeve' },
      { value: 'sleeveless', label: 'Sleeveless' },
      { value: 'off-shoulder', label: 'Off-Shoulder' },
      { value: 'cap-sleeve', label: 'Cap Sleeve' },
      { value: 'bell-sleeve', label: 'Bell Sleeve' },
    ]
  },
];

const OutfitSelector: React.FC<OutfitSelectorProps> = ({
  selectedOutfit,
  selectedOutfitOption,
  onOutfitSelect,
  gender
}) => {
  const [selectedOutfitType, setSelectedOutfitType] = useState(selectedOutfit);

  // Filter options based on gender
  const filteredOptions = outfitOptions.filter(option => {
    if (gender === 'male') {
      return !['gown', 'skirt'].includes(option.value);
    }
    return true;
  });

  const handleOutfitTypeSelect = (outfitType: string) => {
    setSelectedOutfitType(outfitType);
    // Reset outfit option when changing outfit type
    const outfit = filteredOptions.find(o => o.value === outfitType);
    if (outfit && outfit.subOptions.length > 0) {
      onOutfitSelect(outfitType, outfit.subOptions[0].value);
    }
  };

  const handleOutfitOptionSelect = (option: string) => {
    onOutfitSelect(selectedOutfitType, option);
  };

  const getSelectedOutfit = () => filteredOptions.find(o => o.value === selectedOutfit);
  const getSelectedOutfitOption = () => {
    const outfit = getSelectedOutfit();
    return outfit?.subOptions.find(so => so.value === selectedOutfitOption);
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Only select parts of this outfit that you're customizing.
      </h3>

      {/* Outfit Type Selection - Single Row with Perfect Fit */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-3">Outfit Type</h4>

        {/* Perfect fit container - distribute evenly on desktop, scroll on mobile */}
        <div className="relative">
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {filteredOptions.map((outfit) => (
              <button
                key={outfit.value}
                onClick={() => handleOutfitTypeSelect(outfit.value)}
                className={`relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${selectedOutfitType === outfit.value
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
              >
                {/* Outfit Image */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-200 mx-auto ${selectedOutfitType === outfit.value
                    ? 'ring-2 ring-[#D4AF37] ring-offset-1'
                    : ''
                    }`}>
                    <Image
                      src={outfit.image}
                      alt={outfit.label}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] font-medium transition-colors whitespace-nowrap block truncate w-full text-center ${selectedOutfitType === outfit.value
                    ? 'text-[#D4AF37]'
                    : 'text-gray-700'
                    }`}>
                    {outfit.label}
                  </span>
                </div>

                {/* Selected indicator */}
                {selectedOutfitType === outfit.value && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outfit Option Selection */}
      {selectedOutfitType && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Style Option</h4>
          <div className="space-y-2">
            {getSelectedOutfit()?.subOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOutfitOptionSelect(option.value)}
                className={`w-full px-4 py-3 text-left text-sm rounded-lg border-2 transition-colors ${selectedOutfitOption === option.value
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedOutfit && selectedOutfitOption && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Selected Customization</h4>
          <p className="text-sm text-gray-900">
            <span className="font-medium">{getSelectedOutfit()?.label}</span> - {getSelectedOutfitOption()?.label}
          </p>
        </div>
      )}
    </div>
  );
};

export default OutfitSelector;