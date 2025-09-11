// Mock data for dashboard components
import { MetricData, Product, Transaction, Order, ReportMetric, ChartData } from '../types/dashboard';
import { OrdersIcon, ProfitIcon, DiscountIcon } from '../components/dashboard/icons';

export const mockMetrics: MetricData[] = [
  {
    title: "Total Orders",
    value: "25.7K",
    change: "6% vs last 7 days",
    changeType: "positive",
    icon: <OrdersIcon />,
    trendData: [20, 25, 30, 22, 35, 28, 40]
  },
  {
    title: "Total Profit",
    value: "50K",
    change: "12% vs last 7 days",
    changeType: "positive",
    icon: <ProfitIcon />,
    trendData: [30, 35, 40, 32, 45, 38, 50]
  },
  {
    title: "Discounted Amount",
    value: "12K",
    change: "2% vs last 7 days",
    changeType: "negative",
    icon: <DiscountIcon />,
    trendData: [15, 12, 18, 10, 14, 16, 12]
  }
];

export const mockProducts: Product[] = [
  { id: "1", name: "Product #1", itemCode: "#FXZ-4567", price: "NGN999.29" },
  { id: "2", name: "Product #2", itemCode: "#FXZ-4568", price: "NGN899.50" },
  { id: "3", name: "Product #3", itemCode: "#FXZ-4569", price: "NGN1299.99" },
  { id: "4", name: "Product #4", itemCode: "#FXZ-4570", price: "NGN799.00" },
  { id: "5", name: "Product #5", itemCode: "#FXZ-4571", price: "NGN1499.50" },
  { id: "6", name: "Product #6", itemCode: "#FXZ-4572", price: "NGN599.99" }
];

export const mockTransactions: Transaction[] = [
  { id: "#5089", issuedDate: "31 March 2023", total: "NGN1200" },
  { id: "#5090", issuedDate: "30 March 2023", total: "NGN850" },
  { id: "#5091", issuedDate: "29 March 2023", total: "NGN2100" },
  { id: "#5092", issuedDate: "28 March 2023", total: "NGN750" },
  { id: "#5093", issuedDate: "27 March 2023", total: "NGN1800" },
  { id: "#5094", issuedDate: "26 March 2023", total: "NGN950" }
];

export const mockOrders: Order[] = [
  { id: "#6548", customer: "Joseph Wheeler", status: "Pending", amount: "NGN999.29" },
  { id: "#6549", customer: "Sarah Johnson", status: "Completed", amount: "NGN72.40" },
  { id: "#6550", customer: "Mike Davis", status: "Completed", amount: "NGN99.90" },
  { id: "#6551", customer: "Emma Wilson", status: "Pending", amount: "NGN249.99" },
  { id: "#6552", customer: "David Brown", status: "Completed", amount: "NGN79.40" }
];

export const mockReportMetrics: ReportMetric[] = [
  { label: "Customers", value: "24k", active: true },
  { label: "Total Products", value: "3.5k", active: false },
  { label: "Stock Products", value: "2.5k", active: false },
  { label: "Out of Stock", value: "0.5k", active: false },
  { label: "Revenue", value: "250k", active: false }
];

export const mockTodayOrderData: ChartData[] = [
  { day: "Mon", orders: 1200 },
  { day: "Tue", orders: 1900 },
  { day: "Wed", orders: 3000 },
  { day: "Thu", orders: 5000 },
  { day: "Fri", orders: 3000 },
  { day: "Sat", orders: 2000 },
  { day: "Sun", orders: 1000 }
];

export const mockReportsData: ChartData[] = [
  { day: "Mon", value: 24000 },
  { day: "Tue", value: 28000 },
  { day: "Wed", value: 32000 },
  { day: "Thu", value: 35000 },
  { day: "Fri", value: 30000 },
  { day: "Sat", value: 25000 },
  { day: "Sun", value: 20000 }
];
