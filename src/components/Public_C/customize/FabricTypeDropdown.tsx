import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FabricTypeDropdownProps {
  selectedFabric: string;
  onFabricSelect: (fabric: string) => void;
}

interface FabricOption {
  value: string;
  label: string;
  description?: string;
}

const fabricOptions: FabricOption[] = [
  { value: 'Ankara', label: 'Ankara', description: 'Traditional African wax print fabric' },
  { value: 'Lace', label: 'Lace', description: 'Delicate ornamental fabric' },
  { value: 'Cotton', label: 'Cotton', description: 'Soft, breathable natural fiber' },
  { value: 'Silk', label: 'Silk', description: 'Luxurious smooth fabric' },
  { value: 'Chiffon', label: 'Chiffon', description: 'Light, sheer fabric' },
  { value: 'Satin', label: 'Satin', description: 'Smooth, glossy finish' },
  { value: 'Velvet', label: 'Velvet', description: 'Soft, plush fabric' },
  { value: 'Linen', label: 'Linen', description: 'Durable, natural fiber' },
  { value: 'Polyester', label: 'Polyester', description: 'Durable synthetic fabric' },
  { value: 'Viscose', label: 'Viscose', description: 'Soft, breathable synthetic' },
  { value: 'Gele', label: 'Gele', description: 'Traditional head wrap fabric' },
  { value: 'Aso-Oke', label: 'Aso-Oke', description: 'Traditional Nigerian handwoven fabric' },
];

const FabricTypeDropdown: React.FC<FabricTypeDropdownProps> = ({ selectedFabric, onFabricSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter fabrics based on search term
  const filteredFabrics = fabricOptions.filter(fabric =>
    fabric.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fabric.description && fabric.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFabricSelect = (fabric: FabricOption) => {
    onFabricSelect(fabric.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedFabricOption = fabricOptions.find(f => f.value === selectedFabric);

  return (
    <div className="mb-4" ref={dropdownRef}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Fabric Type</h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left bg-white border-2 rounded-lg transition-colors flex items-center justify-between ${
            isOpen
              ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <span className={`${selectedFabric ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedFabric ? selectedFabricOption?.label : 'Choose Fabric Type'}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search fabrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Fabric options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredFabrics.length > 0 ? (
                filteredFabrics.map((fabric) => (
                  <button
                    key={fabric.value}
                    onClick={() => handleFabricSelect(fabric)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedFabric === fabric.value ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{fabric.label}</span>
                      {fabric.description && (
                        <span className="text-xs text-gray-500 mt-1">{fabric.description}</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No fabrics found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected fabric info */}
      {selectedFabricOption && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Selected:</span> {selectedFabricOption.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default FabricTypeDropdown;
