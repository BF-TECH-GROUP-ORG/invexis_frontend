/**
 * Cache Configuration per Global Caching Blueprint
 *
 * This file maps each module to its appropriate caching strategy
 * based on data volatility and business requirements.
 */

// TTL values in milliseconds
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/**
 * Global Caching Strategies per Module
 *
 * Each strategy defines:
 * - ttl: Time-to-live in milliseconds (0 = no cache)
 * - noStore: If true, always fetch fresh data
 * - fullRoute: If true, enable Next.js full route caching
 */
export const CACHE_STRATEGIES = {
  // Analytics - Per widget caching
  ANALYTICS_WIDGET: { ttl: 3 * MINUTE, noStore: false },
  ANALYTICS_REALTIME: { ttl: 0, noStore: true },

  // Staff - Long revalidate
  STAFF: { ttl: 1 * HOUR, fullRoute: true },

  // Shops - Long revalidate
  SHOPS: { ttl: 1 * HOUR, fullRoute: true },

  // Inventory - Split metadata vs real-time
  INVENTORY_METADATA: { ttl: 1 * HOUR, fullRoute: true }, // Product name, SKU, category
  INVENTORY_STOCK: { ttl: 0, noStore: true }, // Stock levels, movement logs
  INVENTORY_REPORTS: { ttl: 24 * HOUR }, // Heavy reports

  // Sales - Split historical vs active
  SALES_HISTORICAL: { ttl: 10 * MINUTE }, // Past sales
  SALES_ACTIVE: { ttl: 0, noStore: true }, // New/active sales

  // Debts
  DEBTS_LIST: { ttl: 90 * SECOND }, // 60-120s range
  DEBTS_DETAIL: { ttl: 60 * SECOND }, // Individual debt details

  // E-commerce Orders
  ECOMMERCE_HISTORICAL: { ttl: 10 * MINUTE },
  ECOMMERCE_ACTIVE: { ttl: 0, noStore: true },

  // Documents
  DOCUMENTS: { ttl: 1 * HOUR, fullRoute: true },

  // Announcements
  ANNOUNCEMENTS: { ttl: 1 * HOUR, fullRoute: true },

  // Notifications - Always real-time
  NOTIFICATIONS: { ttl: 0, noStore: true },

  // Logs/Audits
  LOGS: { ttl: 5 * MINUTE },

  // Billing/Payments
  BILLING_HISTORICAL: { ttl: 10 * MINUTE },
  BILLING_LIVE: { ttl: 0, noStore: true },

  // Reports
  REPORTS_HISTORICAL: { ttl: 24 * HOUR, fullRoute: true },
  REPORTS_CURRENT: { ttl: 0, noStore: true },

  // Categories - Semi-static
  CATEGORIES: { ttl: 30 * MINUTE },

  // Branches - Semi-static
  BRANCHES: { ttl: 1 * HOUR },

  // Organization - Static
  ORGANIZATION: { ttl: 1 * HOUR },

  // Discounts
  DISCOUNTS: { ttl: 15 * MINUTE },

  // Default fallback
  DEFAULT: { ttl: 1 * MINUTE },
};

/**
 * Get cache strategy for a module
 * @param {string} module - Module name (e.g., 'INVENTORY', 'SALES')
 * @param {string} dataType - Data type (e.g., 'METADATA', 'STOCK', 'HISTORICAL', 'ACTIVE')
 * @returns {Object} Cache strategy with ttl, noStore, fullRoute
 *
 * @example
 * getCacheStrategy('INVENTORY', 'METADATA') // Returns { ttl: 3600000, fullRoute: true }
 * getCacheStrategy('INVENTORY', 'STOCK') // Returns { ttl: 0, noStore: true }
 */
export function getCacheStrategy(module, dataType = "DEFAULT") {
  const key = `${module.toUpperCase()}_${dataType.toUpperCase()}`;
  const strategy = CACHE_STRATEGIES[key] || CACHE_STRATEGIES.DEFAULT;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache Strategy] ${key}:`, strategy);
  }

  return strategy;
}

/**
 * Convert Next.js fetch options to cache strategy
 * @param {Object} strategy - Cache strategy from getCacheStrategy
 * @returns {Object} Next.js fetch options
 *
 * @example
 * toFetchOptions({ ttl: 3600000, noStore: false })
 * // Returns: { next: { revalidate: 3600 } }
 */
export function toFetchOptions(strategy) {
  if (strategy.noStore) {
    return { cache: "no-store" };
  }

  if (strategy.ttl > 0) {
    return { next: { revalidate: Math.floor(strategy.ttl / 1000) } };
  }

  return { cache: "force-cache" };
}

/**
 * Check if data is time-based (today vs historical)
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {boolean} True if querying today's data
 */
export function isToday(startDate, endDate) {
  const today = new Date().toDateString();

  if (endDate) {
    return new Date(endDate).toDateString() === today;
  }

  if (startDate) {
    return new Date(startDate).toDateString() === today;
  }

  return true; // No date specified = assume current
}

export default {
  CACHE_STRATEGIES,
  getCacheStrategy,
  toFetchOptions,
  isToday,
};
