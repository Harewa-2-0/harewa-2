'use client';

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  trackingNumber: string;
  deliveryDate: string;
  driver: string;
}

interface DeliveriesTableProps {
  filters: {
    status: string;
    dateRange: string;
    search: string;
  };
}

export default function DeliveriesTable({ filters }: DeliveriesTableProps) {
  // Mock data - replace with actual data fetching
  const deliveries: Delivery[] = [
    {
      id: 'DEL-001',
      orderId: 'ORD-001',
      customerName: 'Aisha Mohammed',
      address: '123 Victoria Island, Lagos',
      status: 'in_transit',
      trackingNumber: 'TRK123456789',
      deliveryDate: '2024-01-22',
      driver: 'John Doe'
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-002',
      customerName: 'Fatima Ibrahim',
      address: '456 Ikoyi, Lagos',
      status: 'delivered',
      trackingNumber: 'TRK123456790',
      deliveryDate: '2024-01-21',
      driver: 'Jane Smith'
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-003',
      customerName: 'Zainab Ali',
      address: '789 Surulere, Lagos',
      status: 'pending',
      trackingNumber: 'TRK123456791',
      deliveryDate: '2024-01-23',
      driver: 'Mike Johnson'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {delivery.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {delivery.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {delivery.customerName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={delivery.address}>
                    {delivery.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(delivery.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {delivery.driver}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(delivery.deliveryDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-[#D4AF37] hover:text-[#D4AF37]/80">
                      Track
                    </button>
                    <button className="text-blue-600 hover:text-blue-800">
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
