import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useFabricsQuery } from '@/hooks/useFabrics';
import { formatPrice } from '@/utils/currency';

interface FabricTypeDropdownProps {
  selectedFabric: string;
  onFabricSelect: (fabricId: string) => void;
}

const FabricTypeDropdown: React.FC<FabricTypeDropdownProps> = ({ 
  selectedFabric, 
  onFabricSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // React Query: Fetch fabrics (cached 10min, shared with FabricMenu!)
  const { data: fabrics = [], isLoading, error } = useFabricsQuery();

  // Filter fabrics based on search term
  const filteredFabrics = fabrics.filter(fabric =>
    fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fabric.type && fabric.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (fabric.color && fabric.color.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleFabricSelect = (fabricId: string) => {
    onFabricSelect(fabricId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedFabricOption = fabrics.find(f => f._id === selectedFabric);

  // Build description from available fabric properties
  const getFabricDescription = (fabric: typeof fabrics[0]) => {
    const parts: string[] = [];
    if (fabric.type) parts.push(fabric.type);
    if (fabric.color) parts.push(fabric.color);
    if (fabric.composition) parts.push(fabric.composition);
    return parts.length > 0 ? parts.join(' • ') : undefined;
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Fabric Type</h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`w-full px-4 py-3 text-left bg-white border-2 rounded-lg transition-colors flex items-center justify-between ${
            isOpen
              ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
              : 'border-gray-300 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={`${selectedFabric ? 'text-gray-900' : 'text-gray-500'}`}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading fabrics...
              </span>
            ) : selectedFabric && selectedFabricOption ? (
              selectedFabricOption.name
            ) : (
              'Choose Fabric Type'
            )}
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
                className="w-full px-3 text-black py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Fabric options */}
            <div className="max-h-48 overflow-y-auto">
              {error ? (
                <div className="px-4 py-3 text-red-500 text-sm">
                  Error loading fabrics: {error instanceof Error ? error.message : String(error)}
                </div>
              ) : isLoading ? (
                <div className="px-4 py-3 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Loading fabrics...</span>
                </div>
              ) : filteredFabrics.length > 0 ? (
                filteredFabrics.map((fabric) => {
                  const description = getFabricDescription(fabric);
                  
                  return (
                    <button
                      key={fabric._id}
                      onClick={() => handleFabricSelect(fabric._id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedFabric === fabric._id ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Fabric image if available */}
                        {fabric.image && (
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={fabric.image} 
                              alt={fabric.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{fabric.name}</span>
                          {description && (
                            <span className="text-xs text-gray-500 mt-1 truncate">{description}</span>
                          )}
                          {/* Show price if available */}
                          {fabric.pricePerMeter && (
                            <span className="text-xs text-[#D4AF37] font-medium mt-1">
                              {formatPrice(fabric.pricePerMeter * 5.486)}/6 yards
                            </span>
                          )}
                          {/* Show stock status */}
                          {fabric.inStock === false && (
                            <span className="text-xs text-red-500 mt-1">Out of stock</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  {fabrics.length === 0 
                    ? 'No fabrics available' 
                    : `No fabrics found matching "${searchTerm}"`
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected fabric info */}
      {selectedFabricOption && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <div className="flex items-start gap-3">
            {selectedFabricOption.image && (
              <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                <img 
                  src={selectedFabricOption.image} 
                  alt={selectedFabricOption.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Selected:</span> {selectedFabricOption.name}
              </p>
              {getFabricDescription(selectedFabricOption) && (
                <p className="text-xs text-gray-500 mt-1">
                  {getFabricDescription(selectedFabricOption)}
                </p>
              )}
              {selectedFabricOption.pricePerMeter && (
                <p className="text-xs text-[#D4AF37] font-medium mt-1">
                  {formatPrice(selectedFabricOption.pricePerMeter * 5.486)} per 6 yards
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricTypeDropdown;