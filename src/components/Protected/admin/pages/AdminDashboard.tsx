'use client';

import { useState, useEffect } from 'react';
import KeyMetricsGrid from './components/dashboard/KeyMetricsGrid';
import PopularProducts from './components/dashboard/PopularProducts';
import LastTransactions from './components/dashboard/LastTransactions';
import TodayOrderChart from './components/dashboard/TodayOrderChart';
import RecentOrders from './components/dashboard/RecentOrders';
import ReportsSection from './components/dashboard/ReportsSection';
import { getDashboardData } from '@/services/dashboard';
import { getDashboardAnalytics } from '@/services/analytics';
import { MetricData, ReportMetric, ChartData } from './types/dashboard';

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

interface AnalyticsData {
  keyMetrics: MetricData[];
  reportMetrics: ReportMetric[];
  reportChartData: ChartData[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both dashboard data and analytics in parallel
        const [dashboard, analytics] = await Promise.all([
          getDashboardData().catch(err => {
            console.error('Dashboard data error:', err);
            return null;
          }),
          getDashboardAnalytics().catch(err => {
            console.error('Analytics data error:', err);
            return null;
          })
        ]);

        if (!dashboard) {
          throw new Error('Failed to load dashboard data');
        }

        setDashboardData(dashboard);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
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
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Failed to load dashboard data'}</p>
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