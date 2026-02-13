import { unstable_cache } from "next/cache";
import AnalyticsService from "@/services/analyticsService";

// Helper to create a cached fetcher
const createCachedFetcher = (key, fetcher, companyId, params, tags = []) => {
    return unstable_cache(
        async () => {
            try {
                const result = await fetcher();
                return result;
            } catch (error) {
                console.error(`Error fetching ${key}:`, error);
                return null; // Return null on error to handle gracefully in UI
            }
        },
        [`analytics-${key}`, companyId, JSON.stringify(params)],
        {
            revalidate: 300,
            tags: ['analytics', `company-${companyId}`, ...tags]
        }
    )();
};

export const getCachedSummary = (companyId, params, options) =>
    createCachedFetcher('summary', () => AnalyticsService.getDashboardSummary(params, options), companyId, params);

export const getCachedSales = (companyId, params, options) =>
    createCachedFetcher('sales', () => AnalyticsService.getRevenueReport(params, options), companyId, params);

export const getCachedProfitability = (companyId, params, options) =>
    createCachedFetcher('profitability', () => AnalyticsService.getProfitabilityReport(params, options), companyId, params);

export const getCachedTopProducts = (companyId, params, options) =>
    createCachedFetcher('products', () => AnalyticsService.getTopProducts(params, options), companyId, params);

export const getCachedInventoryHealth = (companyId, params, options) =>
    createCachedFetcher('inventory', () => AnalyticsService.getInventoryHealth(params, options), companyId, params);

export const getCachedPaymentMethods = (companyId, params, options) =>
    createCachedFetcher('paymentMethods', () => AnalyticsService.getPaymentMethodStats(params, options), companyId, params);

export const getCachedShopPerformance = (companyId, params, options) =>
    createCachedFetcher('shops', () => AnalyticsService.getShopPerformance(params, options), companyId, params);

export const getCachedEmployeePerformance = (companyId, params, options) =>
    createCachedFetcher('employees', () => AnalyticsService.getEmployeePerformance(params, options), companyId, params);

export const getCachedStockMovement = (companyId, params, options) =>
    createCachedFetcher('movement', () => AnalyticsService.getStockMovement(params, options), companyId, params);
