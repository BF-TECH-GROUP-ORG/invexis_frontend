import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

            const data = await apiClient.get(`${API_BASE}/report/general/company/${companyId}`, {
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

            const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/${companyId}`, {
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

            const data = await apiClient.get(`${API_BASE}/sales/reports/v1/${companyId}`, {
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

            const data = await apiClient.get(`${API_BASE}/debt/reports/v1/${companyId}`, {
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
