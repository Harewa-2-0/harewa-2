import React from "react";
import { ChevronDown } from "lucide-react";

interface FilterControlsProps {
  category: string;
  sortBy: "feature" | "price-low" | "price-high" | "newest";
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: "feature" | "price-low" | "price-high" | "newest") => void;
  onMobileFilterToggle: () => void;
  isMobileFilterOpen: boolean;
}

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] hover:border-[#D4AF37] transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value || label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""} text-black`}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-20 overflow-hidden border border-gray-100"
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={value === option}
              className={`px-4 py-2 cursor-pointer text-base text-black hover:bg-[#D4AF37] hover:text-black transition-colors ${
                value === option ? "bg-gray-100" : ""
              }`}
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

const FilterControls: React.FC<FilterControlsProps> = ({
  category,
  sortBy,
  onCategoryChange,
  onSortChange,
  onMobileFilterToggle,
  isMobileFilterOpen,
}) => {
  const categories = ["All", "Men", "Women", "Kids"];

  const getSortDisplayValue = () => {
    switch (sortBy) {
      case "feature":
        return "Feature";
      case "price-low":
        return "Price: Low to High";
      case "price-high":
        return "Price: High to Low";
      case "newest":
        return "Newest";
      default:
        return "Feature";
    }
  };

  const getSortDisplayValueDesktop = () => {
    switch (sortBy) {
      case "feature":
        return "Sort by feature";
      case "price-low":
        return "Price: Low to High";
      case "price-high":
        return "Price: High to Low";
      case "newest":
        return "Newest";
      default:
        return "Sort by feature";
    }
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case "Feature":
      case "Sort by feature":
        onSortChange("feature");
        break;
      case "Price: Low to High":
        onSortChange("price-low");
        break;
      case "Price: High to Low":
        onSortChange("price-high");
        break;
      case "Newest":
        onSortChange("newest");
        break;
    }
  };

  return (
    <div className="py-4">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-4">
        <button
          onClick={onMobileFilterToggle}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Filters
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <CustomDropdown
              value={category}
              options={categories}
              onChange={onCategoryChange}
              label="Category"
            />
          </div>
          <div className="flex-1">
            <CustomDropdown
              value={getSortDisplayValue()}
              options={["Feature", "Price: Low to High", "Price: High to Low", "Newest"]}
              onChange={handleSortChange}
              label="Sort by"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        <button
          onClick={onMobileFilterToggle}
          className="lg:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Filters
        </button>
        <div className="flex items-center space-x-4 ml-auto">
          <CustomDropdown
            value={category}
            options={categories}
            onChange={onCategoryChange}
            label="Category"
          />
          <CustomDropdown
            value={getSortDisplayValueDesktop()}
            options={["Sort by feature", "Price: Low to High", "Price: High to Low", "Newest"]}
            onChange={handleSortChange}
            label="Sort by"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
