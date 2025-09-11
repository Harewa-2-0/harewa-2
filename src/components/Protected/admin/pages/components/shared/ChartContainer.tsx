'use client';

import { ReactNode } from 'react';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  height?: string;
  className?: string;
}

export default function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  height = "h-64",
  className = ""
}: ChartContainerProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className={height}>
        {children}
      </div>
    </div>
  );
}
