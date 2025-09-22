// Dashboard service - transforms real data for dashboard components
import { getOrders } from './order';
import { adminGetProducts } from './products';
import { MetricData, Product, Transaction, Order, ChartData } from '../components/Protected/admin/pages/types/dashboard';

// Transform orders to recent orders format
export function transformOrdersToRecent(orders: any[]): Order[] {
  return orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order._id,
      customer: typeof order.user === 'object' ? order.user.name : 'Unknown Customer',
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1) as 'Pending' | 'Completed' | 'Cancelled' | 'Processing',
      amount: `NGN${order.amount.toLocaleString()}`
    }));
}

// Transform orders to transactions format
export function transformOrdersToTransactions(orders: any[]): Transaction[] {
  return orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map(order => ({
      id: order._id,
      issuedDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      total: `NGN${order.amount.toLocaleString()}`,
      status: order.status
    }));
}

// Transform products to popular products format
export function transformProductsToPopular(products: any[]): Product[] {
  return products.slice(0, 6).map(product => ({
    id: product._id,
    name: product.name,
    itemCode: `#${product._id.slice(-8).toUpperCase()}`,
    price: `NGN${Number(product.price).toLocaleString()}`,
    image: product.images?.[0]
  }));
}

// Transform orders to chart data format
export function transformOrdersToChart(orders: any[]): {
  chartData: ChartData[];
  totalOrders: string;
  changePercentage: string;
  changeType: 'positive' | 'negative';
} {
  // Get orders from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrders = orders.filter(order => 
    new Date(order.createdAt) >= sevenDaysAgo
  );

  // Get orders from previous 7 days for comparison
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const previousWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo;
  });

  // Group by day and count orders
  const dailyData: Record<string, number> = {};
  recentOrders.forEach(order => {
    const day = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    dailyData[day] = (dailyData[day] || 0) + 1;
  });

  // Create chart data with all days of the week
  const chartData: ChartData[] = [
    { day: "Mon", orders: dailyData["Mon"] || 0 },
    { day: "Tue", orders: dailyData["Tue"] || 0 },
    { day: "Wed", orders: dailyData["Wed"] || 0 },
    { day: "Thu", orders: dailyData["Thu"] || 0 },
    { day: "Fri", orders: dailyData["Fri"] || 0 },
    { day: "Sat", orders: dailyData["Sat"] || 0 },
    { day: "Sun", orders: dailyData["Sun"] || 0 }
  ];

  // Calculate totals and changes
  const currentWeekCount = recentOrders.length;
  const previousWeekCount = previousWeekOrders.length;
  
  const totalOrders = orders.length;
  const totalOrdersFormatted = totalOrders >= 1000 
    ? `${(totalOrders / 1000).toFixed(1)}K` 
    : totalOrders.toString();

  const changePercentage = previousWeekCount > 0 
    ? Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100)
    : 0;

  const changeType: 'positive' | 'negative' = changePercentage >= 0 ? 'positive' : 'negative';
  const changeText = `${Math.abs(changePercentage)}% vs last 7 days`;

  return {
    chartData,
    totalOrders: totalOrdersFormatted,
    changePercentage: changeText,
    changeType
  };
}

// Main dashboard data fetcher
export async function getDashboardData() {
  try {
    const [orders, products] = await Promise.all([
      getOrders(),
      adminGetProducts()
    ]);

    return {
      // Real data from existing services
      recentOrders: transformOrdersToRecent(orders),
      lastTransactions: transformOrdersToTransactions(orders),
      popularProducts: transformProductsToPopular(products),
      todayOrderChart: transformOrdersToChart(orders),
      
      // Keep these as mock data until backend provides analytics
      // metrics: mockMetrics,
      // reportMetrics: mockReportMetrics,
      // reportsData: mockReportsData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
