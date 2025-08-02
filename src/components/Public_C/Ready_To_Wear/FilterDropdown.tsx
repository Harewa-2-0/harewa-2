import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-6 relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full text-base font-semibold text-black mb-2 focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{label}{value && <span className="ml-2 font-normal text-gray-600">({value})</span>}</span>
        <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''} text-black`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-20 overflow-hidden border border-gray-100">
          {options.length === 0 && (
            <div className="px-4 py-2 text-gray-400">No options</div>
          )}
          {options.map(option => (
            <div
              key={option}
              className={`px-4 py-2 cursor-pointer text-base text-black hover:bg-[#FDC713] hover:text-black transition-colors ${value === option ? 'bg-gray-100' : ''}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown; 