'use client';

import KeyMetricsCard from './KeyMetricsCard';

interface MetricData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  trendData?: number[];
}

interface KeyMetricsGridProps {
  metrics: MetricData[];
  className?: string;
}

export default function KeyMetricsGrid({ metrics, className = "" }: KeyMetricsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {metrics.map((metric, index) => (
        <KeyMetricsCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
          trendData={metric.trendData}
        />
      ))}
    </div>
  );
}
