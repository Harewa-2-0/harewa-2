'use client';

import { Category } from './CategoriesTable';

interface CategoryStatsProps {
  categories: Category[];
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, change, changeType = 'neutral', icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  }[changeType];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
            <div className="text-[#D4AF37]">
              {icon}
            </div>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 text-sm font-medium ${changeColor}`}>
                {change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryStats({ categories, loading = false }: CategoryStatsProps) {
  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'active').length;
  const inactiveCategories = categories.filter(cat => cat.status === 'inactive').length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const averageProductsPerCategory = totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0;

  // Find most popular category
  const mostPopularCategory = categories.reduce((prev, current) => 
    (prev.productCount > current.productCount) ? prev : current
  );

  // Calculate growth (mock data for demonstration)
  const activeGrowth = '+12%';
  const totalGrowth = '+8%';
  const productsGrowth = '+15%';

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCard
            key={i}
            title=""
            value=""
            icon={<div className="w-4 h-4 bg-gray-200 rounded"></div>}
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Categories"
          value={totalCategories}
          change={totalGrowth}
          changeType="positive"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <StatCard
          title="Active Categories"
          value={activeCategories}
          change={activeGrowth}
          changeType="positive"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <StatCard
          title="Total Products"
          value={totalProducts}
          change={productsGrowth}
          changeType="positive"
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <StatCard
          title="Avg Products/Category"
          value={averageProductsPerCategory}
          icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{activeCategories}</span>
                <span className="text-xs text-gray-500">
                  ({totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Inactive</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{inactiveCategories}</span>
                <span className="text-xs text-gray-500">
                  ({totalCategories > 0 ? Math.round((inactiveCategories / totalCategories) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Category</h3>
          {mostPopularCategory ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <img
                  src={mostPopularCategory.image}
                  alt={mostPopularCategory.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-gray-600 text-sm font-medium">
                    {mostPopularCategory.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{mostPopularCategory.name}</p>
                <p className="text-xs text-gray-500">{mostPopularCategory.productCount} products</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No categories available</p>
          )}
        </div>
      </div>
    </div>
  );
}
