/**
 * Centralized Currency Utility
 * 
 * Change currency configuration in ONE place - affects entire app
 * Supports easy switching between currencies (USD, EUR, GBP, etc.)
 */

export const CURRENCY_CONFIG = {
  code: 'USD',
  symbol: '$',
  locale: 'en-US',
} as const;

/**
 * Format price as currency with symbol
 * Handles both number and string inputs
 * 
 * @param price - Price to format (number or string)
 * @returns Formatted price string
 * 
 * @example
 * formatPrice(1234.56) // "$1,234.56"
 * formatPrice("5000") // "$5,000.00"
 * formatPrice(0) // "$0.00"
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return `${CURRENCY_CONFIG.symbol}0.00`;
  }
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Format amount without currency symbol (just number with commas)
 * 
 * @param amount - Amount to format
 * @returns Formatted number string
 * 
 * @example
 * formatAmount(1234.56) // "1,234.56"
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get current currency symbol
 * 
 * @returns Currency symbol (e.g., "$")
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Get current currency code
 * 
 * @returns Currency code (e.g., "USD")
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.code;
}

/**
 * Format price for display in input fields (no symbol, for editing)
 * 
 * @param price - Price value
 * @returns Plain number string
 * 
 * @example
 * formatPriceForInput(1234.56) // "1234.56"
 */
export function formatPriceForInput(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0';
  }
  
  return numPrice.toString();
}

