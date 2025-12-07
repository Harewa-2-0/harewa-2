'use client';

import Image from 'next/image';
import { type Order } from '@/services/order';

interface OrderPrintHeaderProps {
  order: Order;
}

export default function OrderPrintHeader({ order }: OrderPrintHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: 'Pending',
      initiated: 'Initiated',
      paid: 'Paid',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className="print-header">
      {/* Company Header */}
      <div className="company-header">
        <div className="company-logo">
          <div className="logo-container">
            <Image
              src="/logo.webp"
              alt="HAREWA Logo"
              width={180}
              height={90}
              className="company-logo-image"
            />
          </div>
        </div>
        <div className="order-info">
          <h2 className="order-title">ORDER INVOICE</h2>
          <div className="order-details">
            <div className="order-detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{order._id}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Date:</span>
              <span className="value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Status:</span>
              <span className="value status">{getStatusDisplay(order.status)}</span>
            </div>
            <div className="order-detail-row">
              <span className="label">Total:</span>
              <span className="value total">{formatPrice(order.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="customer-section">
        <h3 className="section-title">Customer Information</h3>
        <div className="customer-details">
          <div className="customer-detail-row">
            <span className="label">Name:</span>
            <span className="value">
              {typeof order.user === 'object' && order.user?.name 
                ? order.user.name 
                : 'Customer Name Not Available'}
            </span>
          </div>
          <div className="customer-detail-row">
            <span className="label">Customer ID:</span>
            <span className="value">
              {typeof order.user === 'object' && order.user?._id 
                ? order.user._id 
                : String(order.user)}
            </span>
          </div>
          <div className="customer-detail-row">
            <span className="label">Delivery Address:</span>
            <span className="value">{order.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
