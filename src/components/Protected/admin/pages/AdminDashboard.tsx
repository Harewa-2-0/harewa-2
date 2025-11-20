'use client';

import KeyMetricsGrid from './components/dashboard/KeyMetricsGrid';
import PopularProducts from './components/dashboard/PopularProducts';
import LastTransactions from './components/dashboard/LastTransactions';
import TodayOrderChart from './components/dashboard/TodayOrderChart';
import RecentOrders from './components/dashboard/RecentOrders';
import ReportsSection from './components/dashboard/ReportsSection';
import { useDashboardQuery, useDashboardAnalyticsQuery } from '@/hooks/useDashboard';
import { PageSpinner } from '../components/Spinner';

export default function AdminDashboard() {
  // Use React Query hooks for data fetching
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard, 
    error: dashboardError 
  } = useDashboardQuery();

  const { 
    data: analyticsData, 
    isLoading: isLoadingAnalytics, 
    error: analyticsError 
  } = useDashboardAnalyticsQuery();

  const loading = isLoadingDashboard || isLoadingAnalytics;
  const error = dashboardError || analyticsError;

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
        <PageSpinner />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load dashboard data';
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <PageSpinner />
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

      {/* Key Metrics - Now using real analytics data */}
      {analyticsData?.keyMetrics && (
        <KeyMetricsGrid metrics={analyticsData.keyMetrics} />
      )}

      {/* Main Content Grid - Use real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularProducts products={dashboardData.popularProducts} />
        <LastTransactions transactions={dashboardData.lastTransactions} />
      </div>

      {/* Bottom Section - Use real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayOrderChart 
          data={dashboardData.todayOrderChart.chartData}
          totalOrders={dashboardData.todayOrderChart.totalOrders}
          change={dashboardData.todayOrderChart.changePercentage}
          changeType={dashboardData.todayOrderChart.changeType}
        />
        <RecentOrders orders={dashboardData.recentOrders} />
      </div>

      {/* Reports Section - Now using real analytics data */}
      {analyticsData?.reportMetrics && analyticsData?.reportChartData && (
        <ReportsSection 
          metrics={analyticsData.reportMetrics}
          chartData={analyticsData.reportChartData}
          onMetricClick={handleMetricClick}
        />
      )}
    </div>
  );
}