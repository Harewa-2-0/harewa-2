import { Package, MoreVertical, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

interface Order {
  id: number | string;
  date: string;
  estimatedDate: string;
  paymentStatus: string;
  paymentMethod: string;
  image: string;
  outfitName: string;
  quantity: number;
  totalPrice: string | number;
}

export const OrderCard = ({ order }: { order: Order }) => {
  const removeItem = useCartStore(state => state.removeItem);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/${order.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      removeItem(String(order.id)); // local Zustand removal
    } catch (error) {
      console.error('Failed to delete item', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow relative"
    >
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        aria-label="Delete item"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Order no #{order.id}</h3>
          <p className="text-sm text-gray-500">Order date: {order.date}</p>
          <p className="text-sm text-gray-500">Estimated: {order.estimatedDate}</p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end">
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
            {order.paymentStatus}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden">
            <img src={order.image} alt="" className="object-cover w-full h-full" />
          </div>
          <div>
            <h4 className="font-medium">{order.outfitName}</h4>
            <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
            <p className="text-sm font-semibold">{order.totalPrice}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View details
        </button>
      </div>
    </motion.div>
  );
};
