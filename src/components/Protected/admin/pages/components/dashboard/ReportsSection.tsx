'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ReportCard from './ReportCard';
import { ChartData, ReportMetric } from '../../types/dashboard';

interface ReportsSectionProps {
  metrics: ReportMetric[];
  chartData: ChartData[];
  onMetricClick?: (metric: ReportMetric) => void;
  className?: string;
}

export default function ReportsSection({ 
  metrics, 
  chartData,
  onMetricClick,
  className = ""
}: ReportsSectionProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        <p className="text-sm text-gray-600">Last 7 Days</p>
      </div>
      
      {/* Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <ReportCard
            key={index}
            label={metric.label}
            value={metric.value}
            active={metric.active}
            onClick={() => onMetricClick?.(metric)}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              dataKey="value" 
              stroke="#D4AF37" 
              strokeWidth={3}
              dot={{ fill: '#D4AF37', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#D4AF37', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
