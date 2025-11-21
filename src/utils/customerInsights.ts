// src/utils/customerInsights.ts
import { type CustomizationResponse } from '@/services/customization';

export interface CustomerStats {
  totalRequests: number;
  customerSince: string | null;
  lastRequestDate: string | null;
  customerStatus: 'new' | 'regular' | 'vip' | 'frequent';
  loyaltyScore: number;
}

export interface CustomerPatterns {
  favoriteOutfitType: string | null;
  favoriteFabricType: string | null;
  favoriteColors: string[];
  commonSizes: string[];
  averageRequestsPerMonth: number;
}

export interface CustomerInsights {
  stats: CustomerStats;
  patterns: CustomerPatterns;
  recommendations: string[];
}

/**
 * Calculate customer status based on request count and frequency
 */
export function getCustomerStatus(
  totalRequests: number,
  recentRequests: number = 0
): 'new' | 'regular' | 'vip' | 'frequent' {
  if (totalRequests === 1) return 'new';
  if (recentRequests >= 3) return 'frequent'; // 3+ requests in recent period
  if (totalRequests >= 5) return 'vip';
  return 'regular';
}

/**
 * Calculate loyalty score based on various factors
 */
export function calculateLoyaltyScore(customizations: CustomizationResponse[]): number {
  if (customizations.length === 0) return 0;

  const totalRequests = customizations.length;
  const requestFrequency = calculateRequestFrequency(customizations);
  const consistency = calculateConsistency(customizations);

  // Weighted scoring: requests (40%), frequency (30%), consistency (30%)
  const score = (totalRequests * 0.4) + (requestFrequency * 0.3) + (consistency * 0.3);
  
  // Normalize to 0-100 scale
  return Math.min(Math.round(score * 10), 100);
}

/**
 * Calculate request frequency (requests per month)
 */
export function calculateRequestFrequency(customizations: CustomizationResponse[]): number {
  if (customizations.length <= 1) return 0;

  const sortedRequests = customizations
    .filter(c => c.createdAt)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

  if (sortedRequests.length < 2) return 0;

  const firstRequest = new Date(sortedRequests[0].createdAt!);
  const lastRequest = new Date(sortedRequests[sortedRequests.length - 1].createdAt!);
  
  const monthsDiff = (lastRequest.getTime() - firstRequest.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  return monthsDiff > 0 ? sortedRequests.length / monthsDiff : 0;
}

/**
 * Calculate consistency in customer preferences
 */
export function calculateConsistency(customizations: CustomizationResponse[]): number {
  if (customizations.length <= 1) return 0;

  const outfitTypes = customizations.map(c => c.outfit).filter(Boolean);
  const fabricTypes = customizations.map(c => c.fabricType).filter(Boolean);
  const sizes = customizations.map(c => c.size).filter(Boolean);

  const outfitConsistency = calculateArrayConsistency(outfitTypes);
  const fabricConsistency = calculateArrayConsistency(fabricTypes);
  const sizeConsistency = calculateArrayConsistency(sizes);

  return (outfitConsistency + fabricConsistency + sizeConsistency) / 3;
}

/**
 * Calculate consistency within an array of values
 */
function calculateArrayConsistency(values: string[]): number {
  if (values.length === 0) return 0;

  const frequency = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxFrequency = Math.max(...Object.values(frequency));
  return maxFrequency / values.length;
}

/**
 * Get the most common value from an array
 */
export function getMostCommon(values: string[]): string | null {
  if (values.length === 0) return null;

  const frequency = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
}

/**
 * Get unique values with their frequency
 */
export function getValueFrequency(values: string[]): Array<{ value: string; count: number }> {
  const frequency = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(frequency)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Analyze customer patterns from customizations
 */
export function analyzeCustomerPatterns(customizations: CustomizationResponse[]): CustomerPatterns {
  const outfitTypes = customizations.map(c => c.outfit).filter(Boolean);
  const fabricTypes = customizations.map(c => c.fabricType).filter(Boolean);
  const colors = customizations.map(c => c.preferredColor).filter(Boolean);
  const sizes = customizations.map(c => c.size).filter(Boolean);

  // Calculate average requests per month
  const averageRequestsPerMonth = calculateRequestFrequency(customizations);

  // Get favorite colors (split by common separators)
  const allColors = colors.flatMap(color => 
    color.split(/\s+and\s+|,\s*|\s*&\s*/).map(c => c.trim().toLowerCase())
  ).filter(Boolean);

  const favoriteColors = getValueFrequency(allColors)
    .slice(0, 3)
    .map(item => item.value);

  return {
    favoriteOutfitType: getMostCommon(outfitTypes),
    favoriteFabricType: getMostCommon(fabricTypes),
    favoriteColors,
    commonSizes: getValueFrequency(sizes).slice(0, 2).map(item => item.value),
    averageRequestsPerMonth: Math.round(averageRequestsPerMonth * 10) / 10,
  };
}

/**
 * Generate customer stats
 */
export function generateCustomerStats(customizations: CustomizationResponse[]): CustomerStats {
  const totalRequests = customizations.length;
  const sortedRequests = customizations
    .filter(c => c.createdAt)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

  const customerSince = sortedRequests[0]?.createdAt || null;
  const lastRequestDate = sortedRequests[sortedRequests.length - 1]?.createdAt || null;

  // Calculate recent requests (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentRequests = customizations.filter(c => 
    c.createdAt && new Date(c.createdAt) >= threeMonthsAgo
  ).length;

  const customerStatus = getCustomerStatus(totalRequests, recentRequests);
  const loyaltyScore = calculateLoyaltyScore(customizations);

  return {
    totalRequests,
    customerSince,
    lastRequestDate,
    customerStatus,
    loyaltyScore,
  };
}

/**
 * Generate recommendations based on customer insights
 */
export function generateRecommendations(
  stats: CustomerStats,
  patterns: CustomerPatterns,
  currentCustomization?: CustomizationResponse
): string[] {
  const recommendations: string[] = [];

  // Status-based recommendations
  if (stats.customerStatus === 'new') {
    recommendations.push('New customer - provide extra attention and guidance');
  } else if (stats.customerStatus === 'vip') {
    recommendations.push('VIP customer - prioritize this request');
  } else if (stats.customerStatus === 'frequent') {
    recommendations.push('Frequent customer - consider loyalty rewards');
  }

  // Pattern-based recommendations
  if (patterns.favoriteOutfitType && currentCustomization?.outfit !== patterns.favoriteOutfitType) {
    recommendations.push(`Customer usually prefers ${patterns.favoriteOutfitType} - confirm this choice`);
  }

  if (patterns.favoriteFabricType && currentCustomization?.fabricType !== patterns.favoriteFabricType) {
    recommendations.push(`Customer typically chooses ${patterns.favoriteFabricType} fabric`);
  }

  if (patterns.commonSizes.length > 0 && currentCustomization?.size && !patterns.commonSizes.includes(currentCustomization.size)) {
    recommendations.push(`Customer usually orders size ${patterns.commonSizes[0]} - verify measurements`);
  }

  // Loyalty-based recommendations
  if (stats.loyaltyScore >= 80) {
    recommendations.push('High loyalty score - excellent customer relationship');
  } else if (stats.loyaltyScore >= 60) {
    recommendations.push('Good customer relationship - maintain quality service');
  }

  // Frequency-based recommendations
  if (patterns.averageRequestsPerMonth >= 2) {
    recommendations.push('Regular customer - consider bulk order discounts');
  }

  return recommendations.slice(0, 4); // Limit to top 4 recommendations
}

/**
 * Generate comprehensive customer insights
 */
export function generateCustomerInsights(
  customizations: CustomizationResponse[],
  currentCustomization?: CustomizationResponse
): CustomerInsights {
  const stats = generateCustomerStats(customizations);
  const patterns = analyzeCustomerPatterns(customizations);
  const recommendations = generateRecommendations(stats, patterns, currentCustomization);

  return {
    stats,
    patterns,
    recommendations,
  };
}
