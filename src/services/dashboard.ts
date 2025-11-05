// Dashboard service - transforms real data for dashboard components
import { getOrders } from './order';
import { adminGetProducts } from './products';
import { MetricData, Product, Transaction, Order, ChartData } from '../components/Protected/admin/pages/types/dashboard';

// Transform orders to recent orders format
export function transformOrdersToRecent(orders: any[]): Order[] {
  if (!Array.isArray(orders) || orders.length === 0) {
    return [];
  }

  return orders
    .filter(order => order && order._id && order.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(order => {
      let customerName = 'Unknown Customer';
      if (order.user) {
        if (typeof order.user === 'object') {
          customerName = order.user.name || order.user.username || order.user.email || 'Unknown Customer';
        } else if (typeof order.user === 'string') {
          customerName = order.user;
        }
      }

      // Normalize status
      let status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing' = 'Pending';
      if (order.status) {
        const normalizedStatus = order.status.toLowerCase();
        if (normalizedStatus === 'completed' || normalizedStatus === 'delivered') {
          status = 'Completed';
        } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
          status = 'Cancelled';
        } else if (normalizedStatus === 'processing' || normalizedStatus === 'shipped') {
          status = 'Processing';
        }
      }

      return {
        id: order._id,
        customer: customerName,
        status,
        amount: formatPrice(Number(order.amount || order.total || 0))
      };
    });
}

// Transform orders to transactions format
export function transformOrdersToTransactions(orders: any[]): Transaction[] {
  if (!Array.isArray(orders) || orders.length === 0) {
    return [];
  }

  return orders
    .filter(order => order && order._id && order.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map(order => {
      const createdDate = new Date(order.createdAt);
      const issuedDate = !isNaN(createdDate.getTime()) 
        ? createdDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : 'Unknown Date';

      return {
        id: order._id,
        issuedDate,
        total: formatPrice(Number(order.amount || order.total || 0)),
        status: order.status || 'pending'
      };
    });
}

// Transform products to popular products format
export function transformProductsToPopular(products: any[]): Product[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  return products
    .filter(product => product && product._id && product.name)
    .slice(0, 6)
    .map(product => {
      const itemCode = product._id 
        ? `#${product._id.slice(-8).toUpperCase()}`
        : '#UNKNOWN';

      const price = Number(product.price || 0);
      const priceFormatted = formatPrice(price);

      // Handle image - could be array or single string
      let image = undefined;
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        image = product.images[0];
      } else if (product.image) {
        image = product.image;
      } else if (product.imageUrl) {
        image = product.imageUrl;
      }

      return {
        id: product._id,
        name: product.name,
        itemCode,
        price: priceFormatted,
        image
      };
    });
}

// Transform orders to chart data format
export function transformOrdersToChart(orders: any[]): {
  chartData: ChartData[];
  totalOrders: string;
  changePercentage: string;
  changeType: 'positive' | 'negative';
} {
  if (!Array.isArray(orders)) {
    return {
      chartData: [
        { day: "Mon", orders: 0 },
        { day: "Tue", orders: 0 },
        { day: "Wed", orders: 0 },
        { day: "Thu", orders: 0 },
        { day: "Fri", orders: 0 },
        { day: "Sat", orders: 0 },
        { day: "Sun", orders: 0 }
      ],
      totalOrders: "0",
      changePercentage: "0% vs last 7 days",
      changeType: 'positive'
    };
  }

  // Get orders from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentOrders = orders.filter(order => {
    if (!order?.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return !isNaN(orderDate.getTime()) && orderDate >= sevenDaysAgo;
  });

  // Get orders from previous 7 days for comparison
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const previousWeekOrders = orders.filter(order => {
    if (!order?.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return !isNaN(orderDate.getTime()) && orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo;
  });

  // Group by day and count orders
  const dailyData: Record<string, number> = {};
  recentOrders.forEach(order => {
    if (!order?.createdAt) return;
    const orderDate = new Date(order.createdAt);
    if (isNaN(orderDate.getTime())) return;
    
    const day = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
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
    //console.log('📊 Fetching dashboard data...');
    
    const [orders, productsResponse] = await Promise.all([
      getOrders().catch(err => {
        console.error('Error fetching orders:', err);
        return []; // Return empty array on error
      }),
      adminGetProducts({ page: 1, limit: 100 }).catch(err => {
        console.error('Error fetching products:', err);
        return []; // Return empty array on error
      })
    ]);

    // Handle paginated response or legacy array
    const products = 'items' in productsResponse ? productsResponse.items : productsResponse;
    const productsArray = Array.isArray(products) ? products : [];

    //console.log('✅ Raw data received:', { 
      //ordersCount: orders.length, 
      //productsCount: products.length 
    //});

    const dashboardData = {
      recentOrders: transformOrdersToRecent(orders),
      lastTransactions: transformOrdersToTransactions(orders),
      popularProducts: transformProductsToPopular(productsArray),
      todayOrderChart: transformOrdersToChart(orders),
    };

    //console.log('✅ Transformed dashboard data:', dashboardData);

    return dashboardData;
  } catch (error) {
    console.error('❌ Error in getDashboardData:', error);
    throw error;
  }
}