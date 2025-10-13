import React, { useState } from 'react';

interface ColorPaletteProps {
  selectedColors: string[];
  onColorSelect: (colors: string[]) => void;
}

interface ColorOption {
  name: string;
  value: string;
  bgColor: string;
  borderColor: string;
}

const colors: ColorOption[] = [
  // Top row from Figma
  { name: 'Red', value: 'Red', bgColor: 'bg-red-500', borderColor: 'border-red-500' },
  { name: 'Orange', value: 'Orange', bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
  { name: 'Yellow', value: 'Yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' },
  { name: 'Lime', value: 'Lime', bgColor: 'bg-lime-500', borderColor: 'border-lime-500' },
  { name: 'Green', value: 'Green', bgColor: 'bg-green-500', borderColor: 'border-green-500' },
  { name: 'Cyan', value: 'Cyan', bgColor: 'bg-cyan-500', borderColor: 'border-cyan-500' },
  { name: 'Sky Blue', value: 'Sky Blue', bgColor: 'bg-sky-500', borderColor: 'border-sky-500' },
  { name: 'Blue', value: 'Blue', bgColor: 'bg-blue-500', borderColor: 'border-blue-500' },
  { name: 'Purple', value: 'Purple', bgColor: 'bg-purple-500', borderColor: 'border-purple-500' },
  // Bottom row from Figma
  { name: 'Pink', value: 'Pink', bgColor: 'bg-pink-500', borderColor: 'border-pink-500' },
  { name: 'Black', value: 'Black', bgColor: 'bg-black', borderColor: 'border-black' },
  { name: 'Brown', value: 'Brown', bgColor: 'bg-amber-800', borderColor: 'border-amber-800' },
  { name: 'Gray', value: 'Gray', bgColor: 'bg-gray-500', borderColor: 'border-gray-500' },
  { name: 'Magenta', value: 'Magenta', bgColor: 'bg-fuchsia-500', borderColor: 'border-fuchsia-500' },
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColors, onColorSelect }) => {
  const handleColorClick = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      // Remove color if already selected
      onColorSelect(selectedColors.filter(color => color !== colorName));
    } else {
      // Add color if not selected (allow multiple selection)
      onColorSelect([...selectedColors, colorName]);
    }
  };

  const formatSelectedColors = () => {
    if (selectedColors.length === 0) return '';
    if (selectedColors.length === 1) return selectedColors[0];
    if (selectedColors.length === 2) return selectedColors.join(' and ');
    return selectedColors.slice(0, -1).join(', ') + ' and ' + selectedColors[selectedColors.length - 1];
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Choose Preferred Color</h3>
        {selectedColors.length > 0 && (
          <span className="text-xs text-gray-500">
            Selected: {formatSelectedColors()}
          </span>
        )}
      </div>
      
      {/* Color Grid - 9 colors in top row, 5 in bottom row */}
      <div className="space-y-2">
        {/* Top row - 9 colors */}
        <div className="flex gap-2 flex-wrap">
          {colors.slice(0, 9).map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorClick(color.name)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                selectedColors.includes(color.name)
                  ? `${color.borderColor} border-4 shadow-lg`
                  : 'border-gray-300 hover:border-gray-400'
              } ${color.bgColor}`}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
        
        {/* Bottom row - 5 colors */}
        <div className="flex gap-2 flex-wrap">
          {colors.slice(9).map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorClick(color.name)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                selectedColors.includes(color.name)
                  ? `${color.borderColor} border-4 shadow-lg`
                  : 'border-gray-300 hover:border-gray-400'
              } ${color.bgColor}`}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </div>
      
      {/* Custom color input for additional colors */}
      <div className="mt-3">
        <input
          type="text"
          placeholder="Add custom color (e.g., Gold, Navy)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              const customColor = target.value.trim();
              if (customColor && !selectedColors.includes(customColor)) {
                onColorSelect([...selectedColors, customColor]);
                target.value = '';
              }
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to add custom colors
        </p>
      </div>
    </div>
  );
};

export default ColorPalette;
