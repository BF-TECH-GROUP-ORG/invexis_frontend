import apiClient from "@/lib/apiClient";

// All report endpoints use relative paths so they route through the Next.js
// /api/proxy catch-all, which injects the Bearer token server-side.
// Using absolute URLs (${API_BASE}/...) bypasses the proxy and causes 401s.

const reportService = {

    /**
     * Get general business report for a company
     * GET /report/general/company/:companyId
     */
    getGeneralReport: async (companyId, { startDate, endDate, filter } = {}, options = {}) => {
        try {
            if (!companyId) throw new Error("Company ID is required");
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filter) params.filter = filter;

            const data = await apiClient.get(`/report/general/company/${companyId}`, {
                params,
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get inventory report for a company
     * GET /inventory/v1/reports/:companyId
     */
    getInventoryReport: async (companyId, { startDate, endDate, filter } = {}, options = {}) => {
        try {
            if (!companyId) throw new Error("Company ID is required");
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filter) params.filter = filter;

            const data = await apiClient.get(`/inventory/v1/reports/${companyId}`, {
                params,
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get sales report for a company
     * GET /sales/reports/v1/:companyId
     */
    getSalesReport: async (companyId, { startDate, endDate, filter } = {}, options = {}) => {
        try {
            if (!companyId) throw new Error("Company ID is required");
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filter) params.filter = filter;

            const data = await apiClient.get(`/sales/reports/v1/${companyId}`, {
                params,
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get debt report for a company
     * GET /debt/reports/v1/:companyId
     */
    getDebtReport: async (companyId, { startDate, endDate, filter } = {}, options = {}) => {
        try {
            if (!companyId) throw new Error("Company ID is required");
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filter) params.filter = filter;

            const data = await apiClient.get(`/debt/reports/v1/${companyId}`, {
                params,
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get payments report for a company
     * GET /payment/reports/v1/:companyId
     */
    getPaymentsReport: async (companyId, { startDate, endDate, filter } = {}, options = {}) => {
        try {
            if (!companyId) throw new Error("Company ID is required");
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (filter) params.filter = filter;

            const data = await apiClient.get(`/payment/reports/v1/${companyId}`, {
                params,
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export default reportService;
