'use client';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">25.7K</p>
              <p className="text-sm text-green-600">↑6% vs last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">50K</p>
              <p className="text-sm text-green-600">↑12% vs last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Discounted Amount */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Discounted Amount</p>
              <p className="text-2xl font-bold text-gray-900">12K</p>
              <p className="text-sm text-red-600">↑2% vs last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.856.416L9.5 15.134 6.146 13.2a1 1 0 010-1.732L9.5 9.134l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Popular Products</h3>
              <p className="text-sm text-gray-600">Total 10.4k Visitors</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Product #{item}</p>
                  <p className="text-xs text-gray-600">Item: #FXZ-4567</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">NGN999.29</p>
              </div>
            ))}
          </div>
        </div>

        {/* Last Transactions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Last Transactions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Issued Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <tr key={item} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">#5089</td>
                    <td className="py-3 text-sm text-gray-600">31 March 2023</td>
                    <td className="py-3 text-sm text-gray-900">NGN1200</td>
                    <td className="py-3">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Order */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today Order</h3>
            <p className="text-2xl font-bold text-gray-900">16.5K</p>
            <p className="text-sm text-green-600">↑6% vs last day</p>
            <p className="text-sm text-gray-600">Orders Over Time</p>
          </div>
          {/* Placeholder for chart */}
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[
              { status: 'Pending', amount: 'NGN999.29' },
              { status: 'Completed', amount: 'NGN72.40' },
              { status: 'Completed', amount: 'NGN99.90' },
              { status: 'Pending', amount: 'NGN249.99' },
              { status: 'Completed', amount: 'NGN79.40' },
            ].map((order, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">#6548</p>
                  <p className="text-xs text-gray-600">Joseph Wheeler</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{order.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-600">Last 7 Days</p>
        </div>
        
        {/* Report Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Customers', value: '24k', active: true },
            { label: 'Total Products', value: '3.5k', active: false },
            { label: 'Stock Products', value: '2.5k', active: false },
            { label: 'Out of Stock', value: '0.5k', active: false },
            { label: 'Revenue', value: '250k', active: false },
          ].map((report, index) => (
            <div key={index} className={`text-center p-4 rounded-lg ${
              report.active ? 'bg-[#FDC713]/10 border-b-2 border-[#FDC713]' : 'bg-gray-50'
            }`}>
              <p className="text-2xl font-bold text-gray-900">{report.value}</p>
              <p className="text-sm text-gray-600">{report.label}</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">7-day trend chart placeholder</p>
        </div>
      </div>
    </div>
  );
}
