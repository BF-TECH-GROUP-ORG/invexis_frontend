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
            console.error('[reportService] getGeneralReport ❌ error:', err?.status, err?.message, err);
            throw err;
        }
    },

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
            console.error('[reportService] getInventoryReport ❌ error:', err?.status, err?.message, err);
            throw err;
        }
    },

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
            console.error('[reportService] getSalesReport ❌ error:', err?.status, err?.message, err);
            throw err;
        }
    },

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
            console.error('[reportService] getDebtReport ❌ error:', err?.status, err?.message, err);
            throw err;
        }
    },

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
            console.error('[reportService] getPaymentsReport ❌ error:', err?.status, err?.message, err);
            throw err;
        }
    }
};

export default reportService;
