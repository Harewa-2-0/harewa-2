import { useState } from 'react';
import { Package, MoreVertical, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deleteOrder, getOrderStatusInfo, type Order } from '@/services/order';
import { useOrderStore } from '@/store/orderStore';
import { useToast } from '@/contexts/toast-context';
import OrderDetailsModal from './order-details-modal';

export const OrderCard = ({ order, onOrderDeleted }: { order: Order; onOrderDeleted?: () => void }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { deletePendingOrder } = useOrderStore();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteOrder(order._id);
      addToast('Order deleted successfully', 'success');
      onOrderDeleted?.(); // Refresh the orders list
    } catch (error) {
      console.error('Failed to delete order', error);
      addToast('Failed to delete order. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelPending = async () => {
    if (isCancelling) return;
    
    try {
      setIsCancelling(true);
      const success = await deletePendingOrder();
      if (success) {
        addToast('Pending order cancelled successfully', 'success');
        onOrderDeleted?.(); // Refresh the orders list
      } else {
        addToast('Failed to cancel pending order. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Failed to cancel pending order', error);
      addToast('Failed to cancel pending order. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = getOrderStatusInfo(order.status);
  const cartId = typeof (order as any).carts === 'string'
    ? (order as any).carts
    : (order as any).carts?._id || '';
  
  const isPendingOrder = order.status === 'pending' || order.status === 'initiated';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow relative"
    >
      <button
        onClick={isPendingOrder ? handleCancelPending : handleDelete}
        disabled={isDeleting || isCancelling}
        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
          isPendingOrder 
            ? 'bg-[#D4AF37] text-black hover:bg-[#B8941F]' 
            : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
        }`}
        aria-label={isPendingOrder ? "Cancel pending order" : "Delete order"}
      >
        {(isDeleting || isCancelling) ? (
          <div className={`w-4 h-4 border-2 border-gray-300 rounded-full animate-spin ${
            isPendingOrder ? 'border-t-black' : 'border-t-red-500'
          }`}></div>
        ) : (
          <X size={16} />
        )}
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900">Order #{order._id.slice(-8)}</h3>
            {isPendingOrder && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <AlertCircle size={12} />
                {statusInfo.label}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">Order date: {formatDate(order.createdAt)}</p>
          <p className="text-sm text-gray-600 font-medium">Updated: {formatDate(order.updatedAt)}</p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end">
          <span className="text-sm text-gray-900 font-semibold">
            {formatPrice(order.amount)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="/cartt.png" 
              alt="Cart items"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <Package size={24} className="text-gray-400 hidden" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Order Items</h4>
            <p className="text-sm text-gray-600 font-medium">Cart ID: {cartId}</p>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(order.amount)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetailsModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            View details
          </button>
          {isPendingOrder && (
            <button
              onClick={() => router.push('/checkout')}
              className="px-4 py-2 text-sm font-medium text-black bg-[#D4AF37] rounded-lg hover:bg-[#B8941F] transition-colors cursor-pointer"
            >
              Complete Payment
            </button>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        orderId={order._id}
      />
    </motion.div>
  );
};
