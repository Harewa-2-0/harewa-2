import React, { useState } from 'react';
import Image from 'next/image';

interface OutfitSelectorProps {
  onSelectionsChange: (selections: { outfit: string; option: string }[]) => void;
  gender?: string;
  initialSelections?: { outfit: string; option: string }[];
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
    value: 'top',
    label: 'Top',
    image: '/sleve.png',
    subOptions: [
      { value: 'fitted-top', label: 'Fitted Top' },
      { value: 'loose-top', label: 'Loose Top' },
      { value: 'crop-top', label: 'Crop Top' },
      { value: 'wrap-top', label: 'Wrap Top' },
      { value: 'peplum-top', label: 'Peplum Top' },
      { value: 'tunic-top', label: 'Tunic Top' },
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
  onSelectionsChange,
  gender,
  initialSelections = []
}) => {
  // Migrate legacy 'blouse' to 'top' in initial selections and deduplicate
  const [selections, setSelections] = useState<{ outfit: string; option: string }[]>(() => {
    const migrated = initialSelections.map(s =>
      s.outfit === 'blouse' ? { ...s, outfit: 'top' } : s
    );
    // Deduplicate by outfit type
    const unique = migrated.filter((s, index, self) =>
      index === self.findIndex((t) => t.outfit === s.outfit)
    );
    return unique;
  });
  const [activeTab, setActiveTab] = useState<string>(outfitOptions[0].value);

  // Filter options based on gender
  const filteredOptions = outfitOptions.filter(option => {
    if (gender === 'male') {
      return !['gown', 'skirt'].includes(option.value);
    }
    return true;
  });

  const handleOutfitToggle = (outfitType: string) => {
    // Migration: Treat 'blouse' and 'top' as the same for selection checks
    const lookupType = (outfitType === 'blouse' || outfitType === 'top') ? ['blouse', 'top'] : [outfitType];
    const isSelected = selections.some(s => lookupType.includes(s.outfit));

    if (isSelected) {
      // Remove selection
      const newSelections = selections.filter(s => !lookupType.includes(s.outfit));
      setSelections(newSelections);
      onSelectionsChange(newSelections);
    } else {
      // Add selection with default first option
      const outfit = filteredOptions.find(o => o.value === outfitType);
      if (outfit && outfit.subOptions.length > 0) {
        const newSelections = [...selections, { outfit: outfitType, option: outfit.subOptions[0].value }];
        setSelections(newSelections);
        onSelectionsChange(newSelections);
        setActiveTab(outfitType);
      }
    }
  };

  const handleOptionSelect = (outfitType: string, option: string) => {
    const newSelections = selections.map(s =>
      s.outfit === outfitType ? { ...s, option } : s
    );
    setSelections(newSelections);
    onSelectionsChange(newSelections);
  };

  const getSelectionForType = (outfitType: string) => selections.find(s => s.outfit === outfitType);

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Select parts of this outfit that you're customizing.
      </h3>

      {/* Outfit Type Multi-Selection */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wider">Customize:</h4>
        <div className="grid grid-cols-5 gap-2">
          {filteredOptions.map((outfit) => {
            const isSelected = selections.some(s => s.outfit === outfit.value);
            return (
              <button
                key={outfit.value}
                onClick={() => handleOutfitToggle(outfit.value)}
                className={`relative p-2 rounded-xl border-2 transition-all duration-300 ${isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-[#D4AF37] ring-offset-2' : 'grayscale'}`}>
                    <Image
                      src={outfit.image}
                      alt={outfit.label}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                    {outfit.label}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Options for Selected Outfits */}
      {selections.length > 0 && activeTab && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {selections.map((selection) => {
              const outfit = outfitOptions.find(o => o.value === selection.outfit);
              if (!outfit) return null;
              return (
                <button
                  key={selection.outfit}
                  onClick={() => setActiveTab(selection.outfit)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === selection.outfit
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                  {outfit.label} Style
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {outfitOptions.find(o => o.value === activeTab)?.subOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(activeTab, option.value)}
                className={`w-full px-4 py-3 text-left text-sm rounded-xl border-2 transition-all ${getSelectionForType(activeTab)?.option === option.value
                  ? 'border-[#D4AF37] bg-white text-[#D4AF37] shadow-sm'
                  : 'border-transparent bg-white text-gray-700 hover:border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {getSelectionForType(activeTab)?.option === option.value && (
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selections.length > 0 && (
        <div className="mt-4 p-4 bg-black rounded-2xl">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selection Summary</h4>
          <div className="space-y-1">
            {selections.map(s => {
              const outfit = outfitOptions.find(o => o.value === s.outfit);
              const option = outfit?.subOptions.find(so => so.value === s.option);
              if (!outfit || !option) return null;
              return (
                <p key={s.outfit} className="text-xs text-white flex items-center space-x-2">
                  <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                  <span className="font-bold">{outfit.label}:</span>
                  <span className="text-gray-300">{option.label}</span>
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitSelector;
