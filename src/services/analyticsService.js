import apiClient from "@/lib/apiClient";
const BASE_API = `${process.env.NEXT_PUBLIC_API_URL_SW || process.env.NEXT_PUBLIC_API_URL}/analytics`

const AnalyticsService = {
    /**
     * Fetch analytics report from backend
     * @param {string} reportType - format: "{category}/{reportName}" (e.g., "sales/revenue")
     * @param {Object} filters - Filter object
     * @param {Object} filters.dateRange - Optional: { start: Date, end: Date }
     * @param {string} filters.period - Optional shortcut period: '24h', '7d', etc.
     * @param {string} filters.interval - Optional interval: 'hour', 'day', 'week', 'month', 'year'
     * @param {string} filters.companyId - Optional company UUID filter
     * @returns {Promise<Object>} - JSON response from API
     */
    getAnalyticsReport: async (reportType, filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateRange?.start && filters.dateRange?.end) {
            params.append('startDate', filters.dateRange.start.toISOString());
            params.append('endDate', filters.dateRange.end.toISOString());
        } else if (filters.period) {
            params.append('period', filters.period);
        }

        if (filters.interval) params.append('interval', filters.interval);
        if (filters.companyId) params.append('companyId', filters.companyId);

        // Note: apiClient handles the Authorization header automatically if set up correctly
        const response = await apiClient.get(`${BASE_API}/reports/${reportType}?${params.toString()}`);
        return response.data;
    },

    // Dashboard & Platform
    getDashboardSummary: async (params) => {
        const data = await apiClient.get(`${BASE_API}/dashboard/summary`, { params });
        return data;
    },
    getPlatformHealth: async () => {
        const data = await apiClient.get(`${BASE_API}/platform/health`);
        return data;
    },

    // Legacy/Raw
    getEventTypes: async () => {
        const data = await apiClient.get(`${BASE_API}/events/types`);
        return data;
    },
    getEventStats: async (params) => {
        const data = await apiClient.get(`${BASE_API}/stats`, { params });
        return data;
    },

    // Enhanced Reports - Sales
    getRevenueReport: async (filters) => {
        return AnalyticsService.getAnalyticsReport('sales/revenue', filters);
    },
    getPaymentMethodStats: async (filters) => {
        return AnalyticsService.getAnalyticsReport('sales/payment-methods', filters);
    },
    getProfitabilityReport: async (filters) => {
        return AnalyticsService.getAnalyticsReport('sales/profitability', filters);
    },

    // Enhanced Reports - Products
    getTopProducts: async (filters) => {
        return AnalyticsService.getAnalyticsReport('products/top', filters); // Assuming this maps to a valid endpoint or needs adjustment
    },
    getReturnRates: async (filters) => {
        return AnalyticsService.getAnalyticsReport('products/returns', filters);
    },

    // Enhanced Reports - Customers
    getNewCustomerStats: async (filters) => {
        return AnalyticsService.getAnalyticsReport('customers/acquisition', filters);
    },
    getActiveUsers: async (filters) => {
        return AnalyticsService.getAnalyticsReport('customers/active', filters);
    },
    getTopCustomers: async (filters) => {
        return AnalyticsService.getAnalyticsReport('customers/top', filters);
    },

    // Shop & Employee Reports
    getShopPerformance: async (filters) => {
        return AnalyticsService.getAnalyticsReport('shops/performance', filters);
    },
    getEmployeePerformance: async (filters) => {
        return AnalyticsService.getAnalyticsReport('employees/performance', filters);
    },

    // Inventory Reports
    getInventoryHealth: async (filters) => {
        return AnalyticsService.getAnalyticsReport('inventory/health', filters);
    },
    getStockMovement: async (filters) => {
        return AnalyticsService.getAnalyticsReport('inventory/movement', filters);
    },
    getTrendingCategories: async (filters) => {
        return AnalyticsService.getAnalyticsReport('categories/trending', filters);
    },
};

export default AnalyticsService;
