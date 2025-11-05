'use client';

import { type Order } from '@/services/order';
import { formatPrice } from '@/utils/currency';

interface OrderPrintItemsProps {
  order: Order;
}

export default function OrderPrintItems({ order }: OrderPrintItemsProps) {
  return (
    <div className="print-items-section">
      <h3 className="section-title">Order Items</h3>
      
      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th className="col-number">#</th>
              <th className="col-sku">SKU</th>
              <th className="col-name">Product Name</th>
              <th className="col-price">Unit Price</th>
              <th className="col-quantity">Qty</th>
              <th className="col-discount">Discount</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.carts?.products?.map((product, index) => (
              <tr key={product._id} className="item-row">
                <td className="col-number">{index + 1}</td>
                <td className="col-sku">-</td>
                <td className="col-name">
                  {product.product || 'Product not found'}
                </td>
                <td className="col-price">-</td>
                <td className="col-quantity">{product.quantity}</td>
                <td className="col-discount">0%</td>
                <td className="col-total">-</td>
              </tr>
            )) || (
              <tr className="no-items-row">
                <td colSpan={7} className="no-items-message">
                  No items available for this order
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
