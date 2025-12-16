import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get reports list for a company
 * GET /v1/reports/company/:companyId
 */
export async function getReports({ companyId, type, page = 1, limit = 20 }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const params = { page, limit };
        if (type) params.type = type;

        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/company/${companyId}`, {
            params
        });
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get a single report by ID
 * GET /v1/reports/:id
 */
export async function getReportById(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Generate a new report
 * POST /v1/reports/generate
 */
export async function generateReport(payload) {
    try {
        const data = await apiClient.post(`${API_BASE}/inventory/v1/reports/generate`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get inventory summary stats
 * GET /v1/reports/summary/:companyId
 */
export async function getInventorySummary(companyId) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/summary/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get ABC analysis
 * GET /v1/reports/abc-analysis/:companyId
 */
export async function getABCAnalysis(companyId) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/abc-analysis/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get stock movement data
 * GET /v1/reports/stock-movement/:companyId
 */
export async function getStockMovement({ companyId, startDate, endDate }) {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/stock-movement/${companyId}`, {
            params
        });
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get aging inventory data
 * GET /v1/reports/aging-inventory/:companyId
 */
export async function getAgingInventory(companyId) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/reports/aging-inventory/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Export report to file
 * POST /v1/reports/export
 */
export async function exportReport({ reportId, format = 'pdf' }) {
    try {
        // For blob response type on export, we access the enhanced axios instance directly if needed
        // But apiClient wrapper usually expects JSON default. 
        // apiClient from lib/apiClient.js wraps calls.

        // However, export expecting 'blob' might need special handling.
        // Let's use apiClient.axios (exposed in apiClient.js) for this specific call to set responseType: 'blob'
        // wait, apiClient.js: 
        // export default { ..., axios: apiClient }
        // The inner apiClient (axios instance) can be used.

        const res = await apiClient.axios.post(`${API_BASE}/inventory/v1/reports/export`,
            { reportId, format },
            {
                responseType: format === 'pdf' ? 'blob' : 'json'
                // Interceptors will still run and attach auth!
            }
        );
        return res.data;
    } catch (err) {
        throw err;
    }
}

export default {
    getReports,
    getReportById,
    generateReport,
    getInventorySummary,
    getABCAnalysis,
    getStockMovement,
    getAgingInventory,
    exportReport
};
