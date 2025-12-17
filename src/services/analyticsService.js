import apiClient from "@/lib/apiClient";
const BASE_API = `${process.env.NEXT_PUBLIC_API_URL_SW || process.env.NEXT_PUBLIC_API_URL}/analytics`

const AnalyticsService = {
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
    getRevenueReport: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/sales/revenue`, { params });
        return data;
    },
    getPaymentMethodStats: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/sales/payment-methods`, { params });
        return data;
    },
    getProfitabilityReport: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/sales/profitability`, { params });
        return data;
    },

    // Enhanced Reports - Products
    getTopProducts: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/products/top`, { params });
        return data;
    },
    getReturnRates: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/products/returns`, { params });
        return data;
    },

    // Enhanced Reports - Customers
    getNewCustomerStats: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/customers/acquisition`, { params });
        return data;
    },
    getActiveUsers: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/customers/active`, { params });
        return data;
    },
    getTopCustomers: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/customers/top`, { params });
        return data;
    },

    // Shop & Employee Reports
    getShopPerformance: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/shops/performance`, { params });
        return data;
    },
    getEmployeePerformance: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/employees/performance`, { params });
        return data;
    },

    // Inventory Reports
    getInventoryHealth: async (params) => {
        const data = await apiClient.get(`${BASE_API}/reports/inventory/health`, { params });
        return data;
    },
};

export default AnalyticsService;
