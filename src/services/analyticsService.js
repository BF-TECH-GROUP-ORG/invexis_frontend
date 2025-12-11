import axios from 'axios';
const BASE_API = `${process.env.NEXT_PUBLIC_API_URL_SW}/analytics`

// Add header to skip ngrok warning
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

const AnalyticsService = {
    // Dashboard & Platform
    getDashboardSummary: async (params) => {
        const response = await axios.get(`${BASE_API}/dashboard/summary`, { params });
        return response.data;
    },
    getPlatformHealth: async () => {
        const response = await axios.get(`${BASE_API}/platform/health`);
        return response.data;
    },

    // Legacy/Raw
    getEventTypes: async () => {
        const response = await axios.get(`${BASE_API}/events/types`);
        return response.data;
    },
    getEventStats: async (params) => {
        const response = await axios.get(`${BASE_API}/stats`, { params });
        return response.data;
    },

    // Enhanced Reports - Sales
    getRevenueReport: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/sales/revenue`, { params });
        return response.data;
    },
    getPaymentMethodStats: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/sales/payment-methods`, { params });
        return response.data;
    },
    getProfitabilityReport: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/sales/profitability`, { params });
        return response.data;
    },

    // Enhanced Reports - Products
    getTopProducts: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/products/top`, { params });
        return response.data;
    },
    getReturnRates: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/products/returns`, { params });
        return response.data;
    },

    // Enhanced Reports - Customers
    getNewCustomerStats: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/customers/acquisition`, { params });
        return response.data;
    },
    getActiveUsers: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/customers/active`, { params });
        return response.data;
    },
    getTopCustomers: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/customers/top`, { params });
        return response.data;
    },

    // Shop & Employee Reports
    getShopPerformance: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/shops/performance`, { params });
        return response.data;
    },
    getEmployeePerformance: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/employees/performance`, { params });
        return response.data;
    },

    // Inventory Reports
    getInventoryHealth: async (params) => {
        const response = await axios.get(`${BASE_API}/reports/inventory/health`, { params });
        return response.data;
    },
};

export default AnalyticsService;
