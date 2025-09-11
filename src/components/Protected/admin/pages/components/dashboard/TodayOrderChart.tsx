'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartData } from '../../types/dashboard';

interface TodayOrderChartProps {
  data: ChartData[];
  totalOrders: string;
  change: string;
  changeType: 'positive' | 'negative';
  className?: string;
}

export default function TodayOrderChart({ 
  data, 
  totalOrders, 
  change, 
  changeType,
  className = ""
}: TodayOrderChartProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today Order</h3>
        <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        <p className={`text-sm ${changeColor}`}>
          {changeType === 'positive' ? '↑' : '↓'}{change}
        </p>
        <p className="text-sm text-gray-600">Orders Over Time</p>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#D4AF37" 
              strokeWidth={2}
              dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#D4AF37', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
