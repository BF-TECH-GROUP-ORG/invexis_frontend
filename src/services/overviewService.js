import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Build API URL safely.
 * Ensures we don't accidentally duplicate `/inventory/v1` if the base URL already contains it.
 */
const buildUrl = (resourcePath) => {
  const base = (API_BASE || "").replace(/\/+$/, "");
  // If base already contains the inventory prefix and resourcePath starts with it, strip the duplicate
  if (
    base.includes("/inventory/v1") &&
    resourcePath.startsWith("/inventory/v1")
  ) {
    return base + resourcePath.replace("/inventory/v1", "");
  }
  return (
    base + (resourcePath.startsWith("/") ? resourcePath : `/${resourcePath}`)
  );
};

/**
 * Overview Service
 *
 * This service centralizes API calls for the Inventory Overview dashboard.
 * It uses the enhanced apiClient for automatic caching, retries, and deduplication.
 */
const OverviewService = {
  // ==================== COMPANY-LEVEL CORE DATA ====================

  /**
   * Get company-wide inventory overview
   * GET /api/v1/companies/:companyId/overview
   */
  getCompanyOverview: async (companyId, options = {}) => {
    const cacheStrategy = getCacheStrategy("ORGANIZATION");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/overview`),
      {
        cache: cacheStrategy,
        ...options,
      }
    );
  },

  /**
   * Get inventory summary for a company
   * GET /api/v1/companies/:companyId/inventory-summary
   */
  getInventorySummary: async (companyId, options = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/inventory-summary`),
      {
        cache: cacheStrategy,
        ...options,
      }
    );
  },

  /**
   * Get all shops for a company
   * Note: API uses `/shop?companyId={companyId}`
   */
  getShops: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("SHOPS");
    return apiClient.get(buildUrl(`/shop`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  /**
   * Get all low-stock products for a company
   * GET /api/v1/companies/:companyId/low-stock
   */
  getLowStock: async (companyId, options = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/low-stock`),
      {
        cache: cacheStrategy,
        ...options,
      }
    );
  },

  // ==================== INVENTORY MOVEMENT & HISTORY ====================

  /**
   * Get all stock changes
   * GET /v1/stock/changes
   */
  getStockChanges: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(buildUrl(`/inventory/v1/stock/changes`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  /**
   * Get inventory adjustment report
   * GET /report/adjustments
   */
  getAdjustments: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "REPORTS");
    return apiClient.get(buildUrl(`/inventory/v1/report/adjustments`), {
      params,
      cache: cacheStrategy,
      ...options
    });
  },

  // ==================== ANALYTICS & REPORTS ====================

  /**
   * Get company-level analytics metrics
   * GET /analytics/company-metrics
   */
  getCompanyMetrics: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/company-metrics`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  /**
   * Get inventory trends graph data
   * GET /analytics/graphs/inventory-trends
   */
  getInventoryTrends: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(
      buildUrl(`/inventory/v1/analytics/graphs/inventory-trends`),
      {
        params,
        cache: cacheStrategy,
        ...options,
      }
    );
  },

  /**
   * Get a full overview analytics payload combining snapshot, KPIs, distributions, trends and activity
   * GET /inventory/v1/analytics/overview?companyId={companyId}
   */
  getOverviewAnalytics: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "OVERVIEW");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/overview`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  /**
   * Get profit comparison graph data
   * GET /analytics/graphs/profit-comparison
   */
  getProfitComparison: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(
      buildUrl(`/inventory/v1/analytics/graphs/profit-comparison`),
      {
        params,
        cache: cacheStrategy,
        ...options
      }
    );
  },

  /**
   * Get top products by profit
   * GET /analytics/top-products
   */
  getTopProducts: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/top-products`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  /**
   * Get stockout risk products
   * GET /analytics/stockout-risk
   */
  getStockoutRisk: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/stockout-risk`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  // ==================== CONTEXTUAL PRODUCT DATA ====================

  /**
   * Get all products. Prefer company-scoped endpoint when companyId is provided:
   * GET /inventory/v1/companies/:companyId/products
   */
  getProducts: async (params = {}, options = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");
    const { companyId, ...query } = params || {};
    if (companyId) {
      return apiClient.get(
        buildUrl(`/inventory/v1/companies/${companyId}/products`),
        {
          params: query,
          cache: cacheStrategy,
          ...options,
        }
      );
    }
    // Fallback to generic products endpoint if companyId isn't provided
    return apiClient.get(buildUrl(`/inventory/v1/products`), {
      params,
      cache: cacheStrategy,
      ...options,
    });
  },

  // ==================== OPTIMIZED COMBINED CALLS ====================
  /**
   * Safe fetch with retries
   */
  safeFetch: async (fetcher, retries = 2) => {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fetcher();
      } catch (err) {
        lastError = err;
        // Only retry on potential network/transient errors
        const isTransient = err.message?.includes('socket') || err.message?.includes('ETIMEDOUT') || err.status === 502 || err.status === 503 || err.status === 504;
        if (!isTransient || i === retries) break;
        console.warn(`[OverviewService] Retry ${i + 1}/${retries} after error:`, err.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw lastError;
  },

  /**
   * Fetch core dashboard data in parallel
   * This is an optimization to reduce sequential waterfall requests
   */
  getDashboardData: async (companyId, params = {}, options = {}) => {
    const results = await Promise.allSettled([
      OverviewService.safeFetch(() => OverviewService.getInventorySummary(companyId, options)),
      OverviewService.safeFetch(() => OverviewService.getCompanyMetrics({ companyId, ...params }, options)),
      OverviewService.safeFetch(() => OverviewService.getInventoryTrends({ companyId, ...params }, options)),
      OverviewService.safeFetch(() => OverviewService.getLowStock(companyId, options)),
    ]);

    const [summary, metrics, trends, lowStock] = results.map((res, idx) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`[OverviewService] Dashboard metric ${idx} failed after retries:`, res.reason?.message);
      return null; // Return null to allow partial data rendering
    });

    return {
      summary,
      metrics,
      trends,
      lowStock,
    };
  },
};

export default OverviewService;
