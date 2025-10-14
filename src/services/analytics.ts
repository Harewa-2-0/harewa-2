// src/services/analytics.ts
import { api } from "@/utils/api";
import { MetricData, ReportMetric, ChartData } from '../components/Protected/admin/pages/types/dashboard';
import React from 'react';

interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    totals: {
      orders: number;
      revenue: number;
      customers: number;
    };
    dailyData: Array<{
      _id: string;
      orders: number;
      revenue: number;
    }>;
    mostPopularOrders: Array<{
      totalQuantity: number;
      productId: string;
      name: string;
    }>;
    activityLog: Array<any>;
  };
}

/**
 * Fetch analytics data from backend
 */
export async function getAnalytics(): Promise<AnalyticsResponse['data']> {
  try {
    const response = await api("/api/analytics", { method: "GET" });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

/**
 * Transform analytics totals into KeyMetrics format
 */
export function transformToKeyMetrics(
  totals: AnalyticsResponse['data']['totals'],
  dailyData: AnalyticsResponse['data']['dailyData']
): MetricData[] {
  // Calculate changes based on comparing current week vs previous week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Split data into current week and previous week
  const currentWeek = dailyData.filter(d => new Date(d._id) >= sevenDaysAgo);
  const previousWeek = dailyData.filter(d => {
    const date = new Date(d._id);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  // Calculate current and previous week totals
  const currentWeekOrders = currentWeek.reduce((sum, d) => sum + d.orders, 0);
  const previousWeekOrders = previousWeek.reduce((sum, d) => sum + d.orders, 0);
  const currentWeekRevenue = currentWeek.reduce((sum, d) => sum + d.revenue, 0);
  const previousWeekRevenue = previousWeek.reduce((sum, d) => sum + d.revenue, 0);

  // Calculate percentage changes
  const ordersChange = previousWeekOrders > 0 
    ? Math.round(((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100)
    : 0;
  
  const revenueChange = previousWeekRevenue > 0
    ? Math.round(((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100)
    : 0;

  // Format numbers
  const formatValue = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Create trend data from last 7 days
  const last7Days = dailyData.slice(-7);
  const ordersTrend = last7Days.map(d => d.orders);
  const revenueTrend = last7Days.map(d => d.revenue / 1000); // Scale down for visual

  return [
    {
      title: "Total Orders",
      value: formatValue(totals.orders),
      change: `${Math.abs(ordersChange)}% vs last 7 days`,
      changeType: ordersChange >= 0 ? 'positive' : 'negative',
      icon: React.createElement('div', { className: 'text-blue-600' }, '📦'), // Placeholder icon
      trendData: ordersTrend.length > 0 ? ordersTrend : [0]
    },
    {
      title: "Total Revenue",
      value: `NGN${formatValue(totals.revenue)}`,
      change: `${Math.abs(revenueChange)}% vs last 7 days`,
      changeType: revenueChange >= 0 ? 'positive' : 'negative',
      icon: React.createElement('div', { className: 'text-green-600' }, '💰'), // Placeholder icon
      trendData: revenueTrend.length > 0 ? revenueTrend : [0]
    },
    {
      title: "Total Customers",
      value: formatValue(totals.customers),
      change: "0% vs last 7 days", // Backend doesn't provide customer change data yet
      changeType: 'positive',
      icon: React.createElement('div', { className: 'text-purple-600' }, '👥'), // Placeholder icon
      trendData: [totals.customers] // Simple placeholder
    }
  ];
}

/**
 * Transform analytics data into Report Metrics format
 */
export function transformToReportMetrics(
  totals: AnalyticsResponse['data']['totals'],
  mostPopularOrders: AnalyticsResponse['data']['mostPopularOrders']
): ReportMetric[] {
  const formatValue = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const totalProducts = mostPopularOrders.reduce((sum, p) => sum + p.totalQuantity, 0);

  return [
    { 
      label: "Customers", 
      value: formatValue(totals.customers), 
      active: true 
    },
    { 
      label: "Total Orders", 
      value: formatValue(totals.orders), 
      active: false 
    },
    { 
      label: "Total Products", 
      value: formatValue(totalProducts), 
      active: false 
    },
    { 
      label: "Revenue", 
      value: `${formatValue(totals.revenue)}`, 
      active: false 
    },
    { 
      label: "Popular Items", 
      value: formatValue(mostPopularOrders.length), 
      active: false 
    }
  ];
}

/**
 * Transform daily data into chart format for Reports Section
 */
export function transformToReportChartData(
  dailyData: AnalyticsResponse['data']['dailyData']
): ChartData[] {
  // Get last 7 days
  const last7Days = dailyData.slice(-7);

  // If we don't have 7 days, fill with zeros
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  if (last7Days.length === 0) {
    return daysOfWeek.map(day => ({ day, value: 0 }));
  }

  // Map the data to day names
  return last7Days.map((data, index) => {
    const date = new Date(data._id);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      day: dayName,
      value: data.revenue
    };
  });
}

/**
 * Get all dashboard analytics data transformed and ready to use
 */
export async function getDashboardAnalytics() {
  try {
    console.log('📊 Fetching analytics data...');
    
    const analyticsData = await getAnalytics();
    
    console.log('✅ Analytics data received:', {
      orders: analyticsData.totals.orders,
      revenue: analyticsData.totals.revenue,
      customers: analyticsData.totals.customers,
      dailyDataPoints: analyticsData.dailyData.length
    });

    return {
      keyMetrics: transformToKeyMetrics(analyticsData.totals, analyticsData.dailyData),
      reportMetrics: transformToReportMetrics(analyticsData.totals, analyticsData.mostPopularOrders),
      reportChartData: transformToReportChartData(analyticsData.dailyData),
      rawData: analyticsData // Keep raw data in case you need it
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    throw error;
  }
}