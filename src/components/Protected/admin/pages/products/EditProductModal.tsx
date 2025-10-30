'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { adminUpdateProduct } from '@/services/products';
import { getCategories, type ProductCategory } from '@/services/product-category';
import { getFabrics, type Fabric } from '@/services/fabric';
import { ButtonSpinner } from '../../components/Spinner';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price: string;
  quantity?: string;
  remainingInStock?: string;
  location?: string;
  images?: string[];
  sizes?: string[];
  gender: string;
  category: string | { _id: string; id: string; name: string; description: string; };
  fabricType?: string;
  seller?: string;
  shop?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: (updatedProduct?: any) => void;
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const genders = ['male', 'female', 'unisex'];

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSuccess
}: EditProductModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Product>({
    id: '',
    _id: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    remainingInStock: '',
    location: '',
    images: [],
    sizes: [],
    gender: '',
    category: '',
    fabricType: '',
    seller: '',
    shop: ''
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        console.log('✅ EditProductModal: Categories fetched:', categoriesData.length);
      } catch (error) {
        console.error('❌ EditProductModal: Error fetching categories:', error);
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
        console.log('✅ EditProductModal: Fabrics fetched:', fabricsData.length);
      } catch (error) {
        console.error('❌ EditProductModal: Error fetching fabrics:', error);
        setFabricsError('Failed to load fabrics');
      } finally {
        setIsLoadingFabrics(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      console.log('Initializing form with product:', product);
      
      // Extract ObjectIds from nested objects
      const categoryId = typeof product.category === 'object' && product.category?._id 
        ? product.category._id 
        : (typeof product.category === 'string' ? product.category : '');
        
      const fabricTypeId = typeof product.fabricType === 'object' && (product.fabricType as any)?._id 
        ? (product.fabricType as any)._id 
        : (typeof product.fabricType === 'string' ? product.fabricType : '');
      
      // Ensure we always have 3 image slots
      const images = product.images || [];
      const paddedImages = [...images];
      while (paddedImages.length < 3) {
        paddedImages.push('');
      }
      
      const initialFormData = {
        id: product.id || product._id || '',
        _id: product._id || product.id || '',
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        quantity: String(product.quantity || ''),
        remainingInStock: String(product.remainingInStock || ''),
        location: product.location || '',
        images: paddedImages.slice(0, 3),
        sizes: product.sizes || [],
        gender: product.gender || '',
        category: categoryId, // This should be the ObjectId
        fabricType: fabricTypeId,
        seller: product.seller || '',
        shop: product.shop || ''
      };
      
      console.log('Category ObjectId extracted:', categoryId);
      console.log('FabricType ObjectId extracted:', fabricTypeId);
      console.log('Setting form data:', initialFormData);
      setFormData(initialFormData);
    }
  }, [product]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Click outside to close (overlay only)
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: '',
        _id: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        remainingInStock: '',
        location: '',
        images: [],
        sizes: [],
        gender: '',
        category: '',
        fabricType: '',
        seller: '',
        shop: ''
      });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (size: string) => {
    setFormData(prev => {
      const currentSizes = prev.sizes || [];
      return {
        ...prev,
        sizes: currentSizes.includes(size)
          ? currentSizes.filter(s => s !== size)
          : [...currentSizes, size]
      };
    });
  };

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).map((img, i) => i === index ? value : img)
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productId = product?.id || product?._id;
    if (!productId) {
      setError('Product ID not found');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Updating product with ID:', productId);
      console.log('Original product data:', product);
      console.log('Form data:', formData);
      
      // Prepare the update payload - handle empty strings and ObjectId fields properly
      const updatePayload: any = {
        name: formData.name,
        description: formData.description || '',
        price: formData.price,
        quantity: formData.quantity || '',
        remainingInStock: formData.remainingInStock || '',
        location: formData.location || '',
        images: (formData.images || []).filter(img => img.trim() !== ''),
        sizes: formData.sizes || [],
        gender: formData.gender
      };

      // Include ObjectId fields - let the backend handle validation
      const categoryValue = typeof formData.category === 'string' ? formData.category : '';
      if (categoryValue && categoryValue.trim() !== '') {
        // Check if it looks like an ObjectId (24 hex characters)
        if (categoryValue.match(/^[0-9a-fA-F]{24}$/)) {
          updatePayload.category = categoryValue;
          console.log('Adding valid ObjectId category to payload:', categoryValue);
        } else {
          console.error('Category is not a valid ObjectId, skipping:', categoryValue);
          setError('Category must be a valid ObjectId (24 characters)');
          return;
        }
      } else {
        console.log('No category value to send');
        setError('Category is required');
        return;
      }
      
      const fabricTypeValue = typeof formData.fabricType === 'string' ? formData.fabricType : '';
      if (fabricTypeValue && fabricTypeValue.trim() !== '') {
        // Check if it looks like an ObjectId (24 hex characters)
        if (fabricTypeValue.match(/^[0-9a-fA-F]{24}$/)) {
          updatePayload.fabricType = fabricTypeValue;
          console.log('Adding valid ObjectId fabricType to payload:', fabricTypeValue);
        } else {
          console.error('FabricType is not a valid ObjectId, skipping:', fabricTypeValue);
          setError('Fabric Type must be a valid ObjectId (24 characters)');
          return;
        }
      } else {
        console.log('No fabricType value to send');
        setError('Fabric Type is required');
        return;
      }
      
      // if (formData.seller && formData.seller.trim() !== '') {
      //   updatePayload.seller = formData.seller;
      // }
      
      // if (formData.shop && formData.shop.trim() !== '') {
      //   updatePayload.shop = formData.shop;
      // }
      
      console.log('Sending update payload:', updatePayload);
      const updatedProduct = await adminUpdateProduct(productId, updatePayload);
      console.log('Product updated successfully:', updatedProduct);
      
      // Show success toast
      addToast('Product updated successfully!', 'success');
      
      // Call success callback to refresh the list
      if (onSuccess) {
        onSuccess(updatedProduct); // Pass the actual API response
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = 'Failed to update product. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage = 'Request was cancelled. Please try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-modal-title"
    >
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 id="edit-modal-title" className="text-lg font-semibold text-gray-900">
                  Edit Product
                </h3>
                <p className="text-sm text-gray-500">Update product information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* API Error Messages */}
          {categoriesError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{categoriesError}</p>
            </div>
          )}
          {fabricsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{fabricsError}</p>
            </div>
          )}

          {/* Warning if no categories or fabrics available */}
          {!isLoadingCategories && !isLoadingFabrics && (categories.length === 0 || fabrics.length === 0) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {categories.length === 0 && fabrics.length === 0 
                  ? "No categories or fabrics available. Please create categories and fabrics first."
                  : categories.length === 0 
                    ? "No categories available. Please create categories first."
                    : "No fabrics available. Please create fabrics first."
                }
              </p>
            </div>
          )}
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={typeof formData.category === 'string' ? formData.category : ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
                disabled={isLoadingCategories}
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
              <p className="text-xs text-gray-500 mt-1">
                Current category: {typeof product?.category === 'object' ? product.category.name : product?.category || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Pricing and Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remaining in Stock
              </label>
              <input
                type="number"
                name="remainingInStock"
                value={formData.remainingInStock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fabricType"
                value={formData.fabricType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                required
                disabled={isLoadingFabrics}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Seller and Shop Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller ID
              </label>
              <input
                type="text"
                name="seller"
                value={formData.seller}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                placeholder="Seller ObjectId (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop ID
              </label>
              <input
                type="text"
                name="shop"
                value={formData.shop}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900"
                placeholder="Shop ObjectId (optional)"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    (formData.sizes || []).includes(size)
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                    {formData.images && formData.images[index] ? (
                      <img
                        src={formData.images[index]}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Update Overlay - Always visible for better UX */}
                    <div className="absolute inset-0 bg-black/30 h-[90%] flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const imageUrl = event.target?.result as string;
                                handleImageChange(index, imageUrl);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Update</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Index Label */}
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500 font-medium">Image {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image URL Input for Manual Entry */}
            <div className="mt-4">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="group-open:hidden">+ Add image URL manually</span>
                  <span className="hidden group-open:inline">- Hide manual URL input</span>
                </summary>
                <div className="mt-2 space-y-2">
                  {(formData.images || []).map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageChange(index, '')}
                        className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Clear image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? <ButtonSpinner /> : <span>Update Product</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
