import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

/**
 * Lookup product by scanned QR/Barcode data
 * POST /v1/stock/lookup
 */
export async function lookupProduct(scanData) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/lookup`, scanData, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Add inventory (restocking)
 * POST /v1/stock/in
 */
export async function stockIn(payload) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/in`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Remove inventory (sales, damage, etc.)
 * POST /v1/stock/out
 */
export async function stockOut(payload) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/out`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Bulk add inventory for multiple products
 * POST /v1/stock/bulk-in
 */
export async function bulkStockIn(items) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/bulk-in`, { items }, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Bulk remove inventory for multiple products
 * POST /v1/stock/bulk-out
 */
export async function bulkStockOut(items) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/bulk-out`, { items }, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all stock changes
 * GET /v1/stock/changes
 */
export async function getAllStockChanges({ page = 1, limit = 20, companyId, productId } = {}) {
    try {
        const params = { page, limit };
        if (companyId) params.companyId = companyId;
        if (productId) params.productId = productId;

        const res = await axios.get(`${API_BASE}/inventory/v1/stock/changes`, { params, headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get stock history for a product
 * GET /v1/stock/history
 */
export async function getStockHistory({ productId, page = 1, limit = 20 } = {}) {
    try {
        const params = { page, limit };
        if (productId) params.productId = productId;

        const res = await axios.get(`${API_BASE}/inventory/v1/stock/history`, { params, headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get stock change by ID
 * GET /v1/stock/changes/:id
 */
export async function getStockChangeById(id) {
    try {
        const res = await axios.get(`${API_BASE}/inventory/v1/stock/changes/${id}`, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

/**
 * Create a stock change manually
 * POST /v1/stock/changes
 */
export async function createStockChange(payload) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/stock/changes`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export default {
    lookupProduct,
    stockIn,
    stockOut,
    bulkStockIn,
    bulkStockOut,
    getAllStockChanges,
    getStockHistory,
    getStockChangeById,
    createStockChange
};
