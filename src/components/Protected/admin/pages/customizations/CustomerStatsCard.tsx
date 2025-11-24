'use client';

import { Crown, User, Calendar, TrendingUp, Star } from 'lucide-react';
import { type CustomerStats, type CustomerPatterns } from '@/utils/customerInsights';

interface CustomerStatsCardProps {
  stats: CustomerStats;
  patterns: CustomerPatterns;
  onViewAllRequests?: () => void;
}

// Get status badge configuration
const getStatusConfig = (status: CustomerStats['customerStatus']) => {
  const configs = {
    new: {
      label: 'New Customer',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: User,
    },
    regular: {
      label: 'Regular Customer',
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: User,
    },
    vip: {
      label: 'VIP Customer',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Crown,
    },
    frequent: {
      label: 'Frequent Customer',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: TrendingUp,
    },
  };
  return configs[status];
};

// Format date to readable string
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get loyalty score color
const getLoyaltyScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export default function CustomerStatsCard({ 
  stats, 
  patterns, 
  onViewAllRequests 
}: CustomerStatsCardProps) {
  const statusConfig = getStatusConfig(stats.customerStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer Overview</h3>
        {onViewAllRequests && stats.totalRequests > 1 && (
          <button
            onClick={onViewAllRequests}
            className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium"
          >
            View All ({stats.totalRequests})
          </button>
        )}
      </div>

      {/* Customer Status Badge */}
      <div className="mb-4">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.className}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getLoyaltyScoreColor(stats.loyaltyScore)}`}>
            {stats.loyaltyScore}
          </div>
          <div className="text-sm text-gray-600">Loyalty Score</div>
        </div>
      </div>

      {/* Timeline Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Customer since:</span>
          <span className="text-gray-900 font-medium">{formatDate(stats.customerSince)}</span>
        </div>
        {stats.lastRequestDate && stats.lastRequestDate !== stats.customerSince && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Last request:</span>
            <span className="text-gray-900 font-medium">{formatDate(stats.lastRequestDate)}</span>
          </div>
        )}
      </div>

      {/* Customer Patterns */}
      {(patterns.favoriteOutfitType || patterns.favoriteFabricType || patterns.favoriteColors.length > 0) && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Preferences</span>
          </h4>
          <div className="space-y-2 text-sm">
            {patterns.favoriteOutfitType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Favorite outfit:</span>
                <span className="text-gray-900 font-medium capitalize">
                  {patterns.favoriteOutfitType}
                </span>
              </div>
            )}
            {patterns.favoriteFabricType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Preferred fabric:</span>
                <span className="text-gray-900 font-medium">{patterns.favoriteFabricType}</span>
              </div>
            )}
            {patterns.favoriteColors.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Favorite colors:</span>
                <span className="text-gray-900 font-medium capitalize">
                  {patterns.favoriteColors.slice(0, 2).join(', ')}
                </span>
              </div>
            )}
            {patterns.commonSizes.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Usual size:</span>
                <span className="text-gray-900 font-medium">
                  {patterns.commonSizes[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Indicator */}
      {patterns.averageRequestsPerMonth > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Activity level:</span>
            <span className="text-gray-900 font-medium">
              {patterns.averageRequestsPerMonth.toFixed(1)} requests/month
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
