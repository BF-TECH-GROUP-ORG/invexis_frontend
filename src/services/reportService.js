import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

/**
 * Get reports list for a company
 * GET /v1/reports/company/:companyId
 */
export async function getReports({ companyId, type, page = 1, limit = 20 }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const params = { page, limit };
        if (type) params.type = type;

        const res = await axios.get(`${API_BASE}/inventory/v1/reports/company/${companyId}`, {
            params,
            headers: defaultHeaders
        });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/reports/${id}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.post(`${API_BASE}/inventory/v1/reports/generate`, payload, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/reports/summary/${companyId}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/reports/abc-analysis/${companyId}`, { headers: defaultHeaders });
        return res.data;
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

        const res = await axios.get(`${API_BASE}/inventory/v1/reports/stock-movement/${companyId}`, {
            params,
            headers: defaultHeaders
        });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/reports/aging-inventory/${companyId}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.post(`${API_BASE}/inventory/v1/reports/export`,
            { reportId, format },
            {
                headers: defaultHeaders,
                responseType: format === 'pdf' ? 'blob' : 'json'
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
