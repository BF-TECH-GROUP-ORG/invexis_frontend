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
  getCompanyOverview: async (companyId) => {
    const cacheStrategy = getCacheStrategy("ORGANIZATION");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/overview`),
      {
        cache: cacheStrategy,
      }
    );
  },

  /**
   * Get inventory summary for a company
   * GET /api/v1/companies/:companyId/inventory-summary
   */
  getInventorySummary: async (companyId) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/inventory-summary`),
      {
        cache: cacheStrategy,
      }
    );
  },

  /**
   * Get all shops for a company
   * Note: API uses `/shop?companyId={companyId}`
   */
  getShops: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("SHOPS");
    return apiClient.get(buildUrl(`/shop`), {
      params,
      cache: cacheStrategy,
    });
  },

  /**
   * Get all low-stock products for a company
   * GET /api/v1/companies/:companyId/low-stock
   */
  getLowStock: async (companyId) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(
      buildUrl(`/inventory/v1/companies/${companyId}/low-stock`),
      {
        cache: cacheStrategy,
      }
    );
  },

  // ==================== INVENTORY MOVEMENT & HISTORY ====================

  /**
   * Get all stock changes
   * GET /v1/stock/changes
   */
  getStockChanges: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");
    return apiClient.get(buildUrl(`/inventory/v1/stock/changes`), {
      params,
      cache: cacheStrategy,
    });
  },

  /**
   * Get inventory adjustment report
   * GET /report/adjustments
   */
  getAdjustments: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "REPORTS");
    return apiClient.get(buildUrl(`/inventory/v1/report/adjustments`), {
      params,
      cache: cacheStrategy,
    });
  },

  // ==================== ANALYTICS & REPORTS ====================

  /**
   * Get company-level analytics metrics
   * GET /analytics/company-metrics
   */
  getCompanyMetrics: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/company-metrics`), {
      params,
      cache: cacheStrategy,
    });
  },

  /**
   * Get inventory trends graph data
   * GET /analytics/graphs/inventory-trends
   */
  getInventoryTrends: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(
      buildUrl(`/inventory/v1/analytics/graphs/inventory-trends`),
      {
        params,
        cache: cacheStrategy,
      }
    );
  },

  /**
   * Get profit comparison graph data
   * GET /analytics/graphs/profit-comparison
   */
  getProfitComparison: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(
      buildUrl(`/inventory/v1/analytics/graphs/profit-comparison`),
      {
        params,
        cache: cacheStrategy,
      }
    );
  },

  /**
   * Get top products by profit
   * GET /analytics/top-products
   */
  getTopProducts: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/top-products`), {
      params,
      cache: cacheStrategy,
    });
  },

  /**
   * Get stockout risk products
   * GET /analytics/stockout-risk
   */
  getStockoutRisk: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("ANALYTICS", "WIDGET");
    return apiClient.get(buildUrl(`/inventory/v1/analytics/stockout-risk`), {
      params,
      cache: cacheStrategy,
    });
  },

  // ==================== CONTEXTUAL PRODUCT DATA ====================

  /**
   * Get all products. Prefer company-scoped endpoint when companyId is provided:
   * GET /inventory/v1/companies/:companyId/products
   */
  getProducts: async (params = {}) => {
    const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");
    const { companyId, ...query } = params || {};
    if (companyId) {
      return apiClient.get(
        buildUrl(`/inventory/v1/companies/${companyId}/products`),
        {
          params: query,
          cache: cacheStrategy,
        }
      );
    }
    // Fallback to generic products endpoint if companyId isn't provided
    return apiClient.get(buildUrl(`/inventory/v1/products`), {
      params,
      cache: cacheStrategy,
    });
  },

  // ==================== OPTIMIZED COMBINED CALLS ====================

  /**
   * Fetch core dashboard data in parallel
   * This is an optimization to reduce sequential waterfall requests
   */
  getDashboardData: async (companyId, params = {}) => {
    const [summary, metrics, trends, lowStock] = await Promise.all([
      OverviewService.getInventorySummary(companyId),
      OverviewService.getCompanyMetrics({ companyId, ...params }),
      OverviewService.getInventoryTrends({ companyId, ...params }),
      OverviewService.getLowStock(companyId),
    ]);

    return {
      summary,
      metrics,
      trends,
      lowStock,
    };
  },
};

export default OverviewService;
