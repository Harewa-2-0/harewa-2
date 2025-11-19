import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/services/dashboard';
import { getDashboardAnalytics } from '@/services/analytics';
import { MetricData, ReportMetric, ChartData } from '@/components/Protected/admin/pages/types/dashboard';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
};

export interface DashboardData {
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

export interface AnalyticsData {
  keyMetrics: MetricData[];
  reportMetrics: ReportMetric[];
  reportChartData: ChartData[];
}

/**
 * Hook to fetch dashboard data (orders, products, charts)
 */
export function useDashboardQuery(enabled: boolean = true) {
  return useQuery<DashboardData, Error>({
    queryKey: dashboardKeys.data(),
    queryFn: async () => {
      return await getDashboardData();
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (admin data changes more frequently)
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to fetch dashboard analytics (metrics, reports)
 */
export function useDashboardAnalyticsQuery(enabled: boolean = true) {
  return useQuery<AnalyticsData, Error>({
    queryKey: dashboardKeys.analytics(),
    queryFn: async () => {
      return await getDashboardAnalytics();
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

