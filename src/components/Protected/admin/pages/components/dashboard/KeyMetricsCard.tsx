'use client';

import { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KeyMetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: ReactNode;
  trendData?: number[];
  className?: string;
}

export default function KeyMetricsCard({
  title,
  value,
  change,
  changeType,
  icon,
  trendData,
  className = ""
}: KeyMetricsCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  const iconBgColor = changeType === 'positive' ? 'bg-green-100' : 'bg-red-100';
  const iconColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm ${changeColor} mt-1`}>
            {changeType === 'positive' ? '↑' : '↓'}{change}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Mini trend line chart */}
      {trendData && (
        <div className="mt-4 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData.map((value, index) => ({ value, index }))}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={changeType === 'positive' ? '#10B981' : '#EF4444'} 
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
