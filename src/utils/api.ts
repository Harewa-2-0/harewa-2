// src/utils/api.ts
export async function fetchProducts() {
  try {
    console.log('Fetching from /api/product...');
    const res = await fetch('/api/product');
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('API response:', data);
    
    if (data.success && data.data) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
}

export async function fetchProductById(id: string) {
  try {
    console.log(`Fetching product with ID: ${id}`);
    const res = await fetch(`/api/product/${id}`);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Product API response:', data);
    
    if (data.success && data.data) {
      return data.data;
    } else if (data._id) {
      return data;
    } else {
      console.warn('Unexpected product API response format:', data);
      return null;
    }
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    throw error;
  }
} 