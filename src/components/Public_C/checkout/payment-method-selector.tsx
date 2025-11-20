'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useOrderStore } from '@/store/orderStore';
import { purchase, getRedirectUrl } from '@/services/payments';
import { useToast } from '@/contexts/toast-context';
import { useCreateOrderMutation, useDeleteOrderMutation, usePendingOrderQuery } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';

interface PaymentMethodSelectorProps {
  isEnabled: boolean;
  onPaymentMethodSelect?: (method: 'paystack' | 'stripe') => void;
}

export default function PaymentMethodSelector({ 
  isEnabled, 
  onPaymentMethodSelect 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'paystack' | 'stripe' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  
  // React Query hooks for order operations
  const { data: pendingOrder } = usePendingOrderQuery();
  const createOrderMutation = useCreateOrderMutation();
  const deleteOrderMutation = useDeleteOrderMutation();
  const { setCurrentOrder } = useOrderStore();

  const handleMethodSelect = (method: 'paystack' | 'stripe') => {
    if (!isEnabled) return;
    // if (method === 'stripe') return; // Stripe enabled now
    if (method === 'paystack') return; // Paystack disabled for now
    setSelectedMethod(method);
    onPaymentMethodSelect?.(method);
  };

  const handlePay = async () => {
    if (!isEnabled) return;
    if (selectedMethod !== 'stripe') {
      addToast('Please select Stripe to continue.', 'error');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Step 1: Delete any existing pending order
      if (pendingOrder) {
        console.log('[Payment] Deleting old pending order...');
        await deleteOrderMutation.mutateAsync(pendingOrder._id);
      }
      
      // Step 2: Create new order from current cart
      console.log('[Payment] Creating order from cart...');
      addToast('Creating order...', 'info');
      const orderResult = await createOrderMutation.mutateAsync();
      
      if (!orderResult.success || !orderResult.order) {
        const errMsg = orderResult.error || 'Failed to create order';
        
        // Handle specific errors
        if (orderResult.errorCode === 'NO_ADDRESS') {
          addToast('Please add a delivery address to your profile', 'error');
          router.push('/profile');
          return;
        }
        
        addToast(errMsg, 'error');
        return;
      }
      
      // Store order for reference
      setCurrentOrder(orderResult.order);
      
      // Step 3: Initiate payment with the new order
      console.log('[Payment] Initiating payment for order:', orderResult.order._id);
      addToast('Initializing payment...', 'info');
      
      const resp = await purchase({ type: 'stripe-gateway', orderId: orderResult.order._id });
      console.log('[Payment] Payment response:', resp);
      
      const redirect = getRedirectUrl(resp);
      if (redirect) {
        addToast('Redirecting to payment gateway…', 'success');
        window.location.href = redirect;
        return;
      }
      
      addToast('No redirect URL returned from gateway. Please try again.', 'error');
      console.error('Full response:', resp);
    } catch (err: any) {
      console.error('Payment error:', err);
      const msg = err?.message || 'Payment initialization failed.';
      addToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Choose Payment method
        </h2>
        <p className="text-gray-600">
          All transactions are secured & encrypted
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        {/* Paystack Image - COMMENTED OUT (using Stripe only)
        <div className="relative">
          <Image 
            src="/paystack.png" 
            alt="Paystack" 
            width={200} 
            height={120}
            onClick={() => handleMethodSelect('paystack')}
            className={`
              cursor-pointer transition-all duration-200 rounded-lg border-2 p-4
              ${selectedMethod === 'paystack' 
                ? 'border-blue-500 shadow-lg' 
                : 'border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-105'
              }
              ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {selectedMethod === 'paystack' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        */}

        {/* Stripe Image (ENABLED) */}
        <div className="relative">
          <Image 
            src="/stripe.png" 
            alt="Stripe" 
            width={200} 
            height={120}
            onClick={() => handleMethodSelect('stripe')}
            className={`
              cursor-pointer transition-all duration-200 rounded-lg border-2 p-4
              ${selectedMethod === 'stripe' 
                ? 'border-purple-500 shadow-lg' 
                : 'border-purple-200 hover:border-purple-300 hover:shadow-md hover:scale-105'
              }
              ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {/* Selection indicator */}
          {selectedMethod === 'stripe' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Payment Button */}
      {selectedMethod === 'stripe' && (
        <div className="mt-8 text-center">
          <button
            onClick={handlePay}
            disabled={!isEnabled || isProcessing}
            className={`px-8 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#B8941F] transition-colors ${(!isEnabled || isProcessing) ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Processing…' : 'PAY WITH STRIPE'}
          </button>
          
          {isProcessing && (
            <p className="text-sm text-gray-500 mt-2">
              Please wait, this may take up to 30 seconds...
            </p>
          )}
        </div>
      )}
    </div>
  );
}