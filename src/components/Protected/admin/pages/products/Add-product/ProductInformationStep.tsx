'use client';

import { useEffect, useState } from 'react';
import { StepProps } from './types';
import { getCategories, type ProductCategory } from '@/services/product-category';
import { getFabrics, type Fabric } from '@/services/fabric';

const availableSizes = ['small', 'medium', 'large', 'extra-large'];
const genders = ['male', 'female', 'unisex'];

export default function ProductInformationStep({ formData, onFormDataChange, onNext }: StepProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingFabrics, setIsLoadingFabrics] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [fabricsError, setFabricsError] = useState<string | null>(null);

  // Fetch categories and fabrics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        setIsLoadingCategories(true);
        setCategoriesError(null);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        console.log('✅ Categories fetched:', categoriesData.length);
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setCategoriesError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }

      try {
        // Fetch fabrics
        setIsLoadingFabrics(true);
        setFabricsError(null);
        const fabricsData = await getFabrics();
        setFabrics(fabricsData);
        console.log('✅ Fabrics fetched:', fabricsData.length);
      } catch (error) {
        console.error('❌ Error fetching fabrics:', error);
        setFabricsError('Failed to load fabrics');
      } finally {
        setIsLoadingFabrics(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const handleSizeToggle = (size: string) => {
    const currentSizes = formData.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    onFormDataChange({ sizes: newSizes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  // Check if we can proceed (both categories and fabrics must be available)
  const canProceed = !isLoadingCategories && !isLoadingFabrics && categories.length > 0 && fabrics.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {categoriesError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{categoriesError}</p>
        </div>
      )}
      {fabricsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{fabricsError}</p>
        </div>
      )}

      {/* Warning if no categories or fabrics available */}
      {!isLoadingCategories && !isLoadingFabrics && (categories.length === 0 || fabrics.length === 0) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            {categories.length === 0 && fabrics.length === 0 
              ? "No categories or fabrics available. Please create categories and fabrics first."
              : categories.length === 0 
                ? "No categories available. Please create categories first."
                : "No fabrics available. Please create fabrics first."
            }
          </p>
        </div>
      )}

      {/* Product name and Description */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Product name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Product description<span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>
      </div>

      {/* Price, Quantity, Remaining in Stock, Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Price (₦)<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Quantity<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Remaining in Stock<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="remainingInStock"
            value={formData.remainingInStock}
            onChange={handleInputChange}
            min="0"
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Location<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          />
        </div>
      </div>

      {/* Category, Fabric Type, Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Category<span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed || isLoadingCategories}
          >
            <option value="">
              {isLoadingCategories ? "Loading..." : "Select category"}
            </option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Fabric Type<span className="text-red-500">*</span>
          </label>
          <select
            name="fabricType"
            value={formData.fabricType}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed || isLoadingFabrics}
          >
            <option value="">
              {isLoadingFabrics ? "Loading..." : "Select fabric"}
            </option>
            {fabrics.map(fabric => (
              <option key={fabric._id} value={fabric._id}>
                {fabric.name} {fabric.type && `(${fabric.type})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Gender<span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
            disabled={!canProceed}
          >
            <option value="">Select gender</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sizes Selection */}
      <div>
        <label className="mb-3 block text-base font-medium text-gray-700">
          Available Sizes<span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableSizes.map(size => (
            <label key={size} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sizes?.includes(size) || false}
                onChange={() => handleSizeToggle(size)}
                className="w-4 h-4 text-[#D4AF37] bg-gray-100 border-gray-300 rounded focus:ring-[#D4AF37] focus:ring-2"
                disabled={!canProceed}
              />
              <span className="text-sm text-gray-700 capitalize">{size.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
        {formData.sizes && formData.sizes.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            Selected sizes: {formData.sizes.map(size => size.replace('-', ' ')).join(', ')}
          </p>
        )}
      </div>
    </form>
  );
}
