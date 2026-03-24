import apiClient from "@/lib/apiClient";
import { getSession } from "next-auth/react";

/**
 * Helper: get Authorization header from current session.
 * This ensures the Bearer token is always attached regardless of proxy config.
 */
async function getAuthHeaders() {
    const session = await getSession();
    if (session?.accessToken) {
        return { Authorization: `Bearer ${session.accessToken}` };
    }
    return {};
}

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

            const authHeaders = await getAuthHeaders();
            const data = await apiClient.get(`/report/general/company/${companyId}`, {
                params,
                headers: { ...authHeaders, ...(options.headers || {}) },
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

            const authHeaders = await getAuthHeaders();
            const data = await apiClient.get(`/inventory/v1/reports/${companyId}`, {
                params,
                headers: { ...authHeaders, ...(options.headers || {}) },
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

            const authHeaders = await getAuthHeaders();
            const data = await apiClient.get(`/sales/reports/v1/${companyId}`, {
                params,
                headers: { ...authHeaders, ...(options.headers || {}) },
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

            const authHeaders = await getAuthHeaders();
            const data = await apiClient.get(`/debt/reports/v1/${companyId}`, {
                params,
                headers: { ...authHeaders, ...(options.headers || {}) },
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

            const authHeaders = await getAuthHeaders();
            const data = await apiClient.get(`/payment/reports/v1/${companyId}`, {
                params,
                headers: { ...authHeaders, ...(options.headers || {}) },
                ...options
            });
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export default reportService;
