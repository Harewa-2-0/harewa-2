import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export const useFetchCart = () => {
  const { addItem, clearCart } = useCartStore();

  interface CartItem {
        id: string;
        name: string;
        price: number;
        quantity: number;
        // Add other properties as needed
      }

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/me`, {
          credentials: 'include',
        });
        const { items } = await res.json();
        clearCart();
        items.forEach((item: CartItem) => addItem(item));
      } catch (e) {
        console.error('Error fetching cart', e);
      }
    };

    fetchCart();
  }, []);
};
