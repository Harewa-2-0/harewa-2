// Dashboard data types
import { ReactNode } from 'react';

export interface MetricData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: ReactNode;
  trendData?: number[];
}

export interface Product {
  id: string;
  name: string;
  itemCode: string;
  price: string;
  image?: string;
}

export interface Transaction {
  id: string;
  issuedDate: string;
  total: string;
  status?: string;
}

export interface Order {
  id: string;
  customer: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing';
  amount: string;
}

export interface ReportMetric {
  label: string;
  value: string;
  active: boolean;
}

export interface ChartData {
  day: string;
  value?: number;
  orders?: number;
}

