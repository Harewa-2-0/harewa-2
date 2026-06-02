'use client';

import { type Order } from '@/services/order';
import { formatPrice } from '@/utils/currency';
import { getOrderDisplayLines } from '@/utils/orderCartLines';

interface OrderPrintItemsProps {
  order: Order;
}

export default function OrderPrintItems({ order }: OrderPrintItemsProps) {
  const displayLines = getOrderDisplayLines(order.carts);

  return (
    <div className="print-items-section">
      <h3 className="section-title">Order Items</h3>

      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th className="col-number">#</th>
              <th className="col-sku">Type</th>
              <th className="col-name">Name</th>
              <th className="col-price">Unit Price</th>
              <th className="col-quantity">Qty</th>
              <th className="col-discount">Details</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {displayLines.length > 0 ? (
              displayLines.map((line, index) => (
                <tr key={line.key} className="item-row">
                  <td className="col-number">{index + 1}</td>
                  <td className="col-sku">
                    {line.kind === 'fabric' ? 'Fabric' : 'Product'}
                  </td>
                  <td className="col-name">{line.name}</td>
                  <td className="col-price">
                    {formatPrice(line.unitPrice)}
                    {line.kind === 'fabric' && (
                      <span className="block text-xs text-gray-500">
                        per {line.yardBundle} yd bundle
                      </span>
                    )}
                  </td>
                  <td className="col-quantity">
                    x{line.quantity} ({line.unitLabel})
                  </td>
                  <td className="col-discount">
                    {line.productNote?.length
                      ? line.productNote.join(', ')
                      : '—'}
                  </td>
                  <td className="col-total">{formatPrice(line.lineTotal)}</td>
                </tr>
              ))
            ) : (
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
