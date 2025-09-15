'use client';

import { StepProps } from './types';

const categories = ['Dresses', 'Tops', 'Accessories', 'Shoes'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProductInformationStep({ formData, onFormDataChange, onNext }: StepProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product name and Manufacturer in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          />
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Manufacturer<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
      </div>

      {/* Category, Size, and Quantity in one row */}
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
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c} value={c.toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-base font-medium text-gray-700">
            Size<span className="text-red-500">*</span>
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-4 text-base text-black focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
            required
          >
            <option value="">Select size</option>
            {sizes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
          />
        </div>
      </div>

      {/* Description - increased rows */}
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
        />
      </div>
    </form>
  );
}
