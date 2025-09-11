'use client';

import KeyMetricsGrid from './components/dashboard/KeyMetricsGrid';
import PopularProducts from './components/dashboard/PopularProducts';
import LastTransactions from './components/dashboard/LastTransactions';
import TodayOrderChart from './components/dashboard/TodayOrderChart';
import RecentOrders from './components/dashboard/RecentOrders';
import ReportsSection from './components/dashboard/ReportsSection';
import { 
  mockMetrics, 
  mockProducts, 
  mockTransactions, 
  mockOrders, 
  mockReportMetrics, 
  mockTodayOrderData, 
  mockReportsData 
} from './data/mockData';

export default function AdminDashboard() {
  const handleMetricClick = (metric: any) => {
    console.log('Metric clicked:', metric);
    // TODO: Handle metric click - could filter charts, show details, etc.
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <KeyMetricsGrid metrics={mockMetrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularProducts products={mockProducts} />
        <LastTransactions transactions={mockTransactions} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayOrderChart 
          data={mockTodayOrderData}
          totalOrders="16.5K"
          change="6% vs last day"
          changeType="positive"
        />
        <RecentOrders orders={mockOrders} />
      </div>

      {/* Reports Section */}
      <ReportsSection 
        metrics={mockReportMetrics}
        chartData={mockReportsData}
        onMetricClick={handleMetricClick}
      />
    </div>
  );
}
