'use client';

import { useState, useEffect } from 'react';
import KeyMetricsGrid from './components/dashboard/KeyMetricsGrid';
import PopularProducts from './components/dashboard/PopularProducts';
import LastTransactions from './components/dashboard/LastTransactions';
import TodayOrderChart from './components/dashboard/TodayOrderChart';
import RecentOrders from './components/dashboard/RecentOrders';
import ReportsSection from './components/dashboard/ReportsSection';
import { 
  mockMetrics, 
  mockReportMetrics, 
  mockReportsData 
} from './data/mockData';
import { getDashboardData } from '@/services/dashboard';

interface DashboardData {
  recentOrders: any[];
  lastTransactions: any[];
  popularProducts: any[];
  todayOrderChart: {
    chartData: any[];
    totalOrders: string;
    changePercentage: string;
    changeType: 'positive' | 'negative';
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleMetricClick = (metric: any) => {
    console.log('Metric clicked:', metric);
    // TODO: Handle metric click - could filter charts, show details, etc.
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics - Keep as mock data until backend provides analytics */}
      <KeyMetricsGrid metrics={mockMetrics} />

      {/* Main Content Grid - Use real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularProducts products={dashboardData!.popularProducts} />
        <LastTransactions transactions={dashboardData!.lastTransactions} />
      </div>

      {/* Bottom Section - Use real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayOrderChart 
          data={dashboardData!.todayOrderChart.chartData}
          totalOrders={dashboardData!.todayOrderChart.totalOrders}
          change={dashboardData!.todayOrderChart.changePercentage}
          changeType={dashboardData!.todayOrderChart.changeType}
        />
        <RecentOrders orders={dashboardData!.recentOrders} />
      </div>

      {/* Reports Section - Keep as mock data until backend provides analytics */}
      <ReportsSection 
        metrics={mockReportMetrics}
        chartData={mockReportsData}
        onMetricClick={handleMetricClick}
      />
    </div>
  );
}
