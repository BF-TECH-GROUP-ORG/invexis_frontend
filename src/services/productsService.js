import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

/**
 * -----------------------------------------------------
 * Inventory API routes
 * -----------------------------------------------------
 */
const INVENTORY_BASE = "/inventory/v1";

/**
 * -----------------------------------------------------
 * Get paginated products
 * SSR-safe: pass token when calling from server
 * -----------------------------------------------------
 */
export async function getProducts({
  page = 1,
  limit = 20,
  category,
  search,
  companyId,
} = {}, options = {}) {
  if (!companyId) return [];

  const params = { page, limit };
  if (category) params.category = category;
  if (search) params.search = search;

  return apiClient.get(`${INVENTORY_BASE}/companies/${companyId}/products`, {
    params,
    ...options,
    cache: { noStore: true },
  });
}

/**
 * -----------------------------------------------------
 * Featured products
 * -----------------------------------------------------
 */
export async function getFeaturedProducts(options = {}) {
  const cache = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${INVENTORY_BASE}/products/featured`, {
    cache,
    ...options,
  });
}

/**
 * -----------------------------------------------------
 * Product by ID
 * -----------------------------------------------------
 */
export async function getProductById(id, options = {}) {
  if (!id) throw new Error("Product ID is required");

  const cache = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${INVENTORY_BASE}/products/${id}`, {
    cache,
    ...options,
  });
}

/**
 * -----------------------------------------------------
 * Create product
 * -----------------------------------------------------
 */
export async function createProduct(payload, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const data = await apiClient.post(
    `${INVENTORY_BASE}/products`,
    payload,
    options
  );

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Update product
 * -----------------------------------------------------
 */
export async function updateProduct(id, updates, options = {}) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.put(`${INVENTORY_BASE}/products/${id}`, updates, options);

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Delete product
 * -----------------------------------------------------
 */
export async function deleteProduct(id, options = {}) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.delete(`${INVENTORY_BASE}/products/${id}`, options);

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Update stock
 * -----------------------------------------------------
 */
export async function updateStock(id, stockData, options = {}) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.patch(
    `${INVENTORY_BASE}/products/${id}/stock`,
    stockData,
    options
  );

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Search products (real-time)
 * -----------------------------------------------------
 */
export async function searchProducts(query, options = {}) {
  if (!query) return [];

  return apiClient.get(`${INVENTORY_BASE}/products/search`, {
    params: { q: query },
    ...options,
    cache: { noStore: true },
  });
}

const productsService = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  searchProducts,
};

export default productsService;
