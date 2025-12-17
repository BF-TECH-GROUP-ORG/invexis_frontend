import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Lookup product by scanned QR/Barcode data
 * POST /v1/stock/lookup
 */
export async function lookupProduct(scanData) {
  try {
    const res = await apiClient.post(
      `${API_BASE}/inventory/v1/stock/lookup`,
      scanData
    );
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Add inventory (restocking)
 * POST /v1/stock/in
 *
 * @param {Object} payload - The inventory data to add
 * @returns {Promise<Object>} The response data from the API
 */
export async function stockIn(payload) {
  try {
    const res = await apiClient.post(
      `${API_BASE}/inventory/v1/stock/in`,
      payload
    );
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Remove inventory (sales, damage, etc.)
 * POST /v1/stock/out
 *
 * @param {Object} payload - The inventory data to remove
 * @returns {Promise<Object>} The response data from the API
 */
export async function stockOut(payload) {
  try {
    const res = await apiClient.post(
      `${API_BASE}/inventory/v1/stock/out`,
      payload
    );
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Bulk add inventory for multiple products
 * POST /v1/stock/bulk-in
 *
 * @param {Array<Object>} items - An array of items to add to inventory
 * @returns {Promise<Object>} The response data from the API
 */
export async function bulkStockIn(items) {
  try {
    const res = await apiClient.post(`${API_BASE}/inventory/v1/stock/bulk-in`, {
      items,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Bulk remove inventory for multiple products
 * POST /v1/stock/bulk-out
 *
 * @param {Array<Object>} items - An array of items to remove from inventory
 * @returns {Promise<Object>} The response data from the API
 */
export async function bulkStockOut(items) {
  try {
    const res = await apiClient.post(
      `${API_BASE}/inventory/v1/stock/bulk-out`,
      { items }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
}

/**
 * Get all stock changes (REAL-TIME DATA - always fresh)
 * GET /v1/stock/changes
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.companyId - Company ID
 * @param {string} params.productId - Product ID
 * @returns {Promise<Object>} Stock changes data
 *
 * CACHING: NO-STORE - Real-time stock movements must always be current
 */
export async function getAllStockChanges({
  page = 1,
  limit = 20,
  companyId,
  productId,
} = {}) {
  const cacheStrategy = getCacheStrategy("INVENTORY", "STOCK");

  const params = { page, limit };
  if (companyId) params.companyId = companyId;
  if (productId) params.productId = productId;

  return apiClient.get(`${API_BASE}/inventory/v1/stock/changes`, {
    params,
    cache: cacheStrategy, // NO-STORE
  });
}

/**
 * Get stock history for a product (historical data can be cached)
 * GET /v1/stock/history
 *
 * @param {Object} params - Query parameters
 * @param {string} params.productId - Product ID
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Stock history data
 *
 * CACHING: Metadata cached for 1 hour (historical data changes infrequently)
 */
export async function getStockHistory({
  productId,
  page = 1,
  limit = 20,
} = {}) {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");

  const params = { page, limit };
  if (productId) params.productId = productId;

  return apiClient.get(`${API_BASE}/inventory/v1/stock/history`, {
    params,
    cache: cacheStrategy, // 1 hour cache
  });
}

/**
 * Get stock change by ID
 * GET /v1/stock/changes/:id
 *
 * @param {string} id - The ID of the stock change to retrieve
 * @returns {Promise<Object>} The stock change data
 */
export async function getStockChangeById(id) {
  return apiClient.get(`${API_BASE}/inventory/v1/stock/changes/${id}`);
}

/**
 * Create a stock change manually
 * POST /v1/stock/changes
 *
 * @param {Object} payload - Stock change data
 * @returns {Promise<Object>} Created stock change data
 */
export async function createStockChange(payload) {
  return apiClient.post(`${API_BASE}/inventory/v1/stock/changes`, payload);
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
  createStockChange,
};
