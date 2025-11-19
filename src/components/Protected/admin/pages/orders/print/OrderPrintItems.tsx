'use client';

import { type Order } from '@/services/order';
import { formatPrice } from '@/utils/currency';

interface OrderPrintItemsProps {
  order: Order;
}

export default function OrderPrintItems({ order }: OrderPrintItemsProps) {
  // Helper to get product information safely
  const getProductInfo = (cartProduct: { product: string | null | { _id?: string; name?: string; price?: number; images?: string[]; [key: string]: any } }) => {
    if (!cartProduct.product) {
      return { id: null, name: 'Product not found', price: undefined };
    }
    
    if (typeof cartProduct.product === 'string') {
      // Product is just an ID string
      return { 
        id: cartProduct.product, 
        name: `Product ${cartProduct.product.substring(0, 8)}`, 
        price: undefined
      };
    }
    
    // Product is a populated object
    return {
      id: cartProduct.product._id || null,
      name: cartProduct.product.name || 'Product not found',
      price: typeof cartProduct.product.price === 'number' ? cartProduct.product.price : undefined,
    };
  };

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
            {order.carts?.products?.map((cartProduct, index) => {
              const productInfo = getProductInfo(cartProduct);
              const itemTotal = productInfo.price && cartProduct.quantity 
                ? productInfo.price * cartProduct.quantity 
                : undefined;
              
              return (
                <tr key={cartProduct._id || index} className="item-row">
                  <td className="col-number">{index + 1}</td>
                  <td className="col-sku">
                    {productInfo.id ? productInfo.id.substring(0, 8) : '-'}
                  </td>
                  <td className="col-name">
                    {productInfo.name}
                  </td>
                  <td className="col-price">
                    {productInfo.price ? formatPrice(productInfo.price) : '-'}
                  </td>
                  <td className="col-quantity">{cartProduct.quantity}</td>
                  <td className="col-discount">0%</td>
                  <td className="col-total">
                    {itemTotal ? formatPrice(itemTotal) : '-'}
                  </td>
                </tr>
              );
            }) || (
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
