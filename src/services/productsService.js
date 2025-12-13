import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (typeof window !== "undefined") {
  console.info("ProductsService: using API base ->", API_BASE);
}

/**
 * Get paginated products list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Products data
 *
 * CACHING: Inventory metadata cached for 1 hour
 */
export async function getProducts({
  page = 1,
  limit = 20,
  category,
  search,
  companyId,
} = {}) {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");

  const params = { page, limit };
  if (category) params.category = category;
  if (search) params.search = search;
  if (companyId) params.companyId = companyId;

  return apiClient.get(
    `${API_BASE}/inventory/v1/companies/${companyId}/products`,
    {
      params,
      cache: cacheStrategy,
    }
  );
}

/**
 * Get featured products
 * CACHING: Cached for 1 hour
 */
export async function getFeaturedProducts() {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${API_BASE}/inventory/v1/products/featured`, {
    cache: cacheStrategy,
  });
}

/**
 * Get product by ID
 * CACHING: Metadata cached for 1 hour
 */
export async function getProductById(id) {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${API_BASE}/inventory/v1/products/${id}`, {
    cache: cacheStrategy,
  });
}

/**
 * Create a new product
 * @param {Object} payload - Product data
 * @returns {Promise<Object>} Created product
 *
 * CACHING: POST never cached. Clears products cache after creation.
 */
export async function createProduct(payload) {
  // Check if payload is FormData (for file uploads)
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const data = await apiClient.post(
    `${API_BASE}/inventory/v1/products`,
    payload,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
  );

  // Clear products cache since we added new data
  apiClient.clearCache("/products");

  return data;
}

/**
 * Update an existing product
 * CACHING: PUT never cached. Clears products cache.
 */
export async function updateProduct(id, updates) {
  const data = await apiClient.put(
    `${API_BASE}/inventory/v1/products/${id}`,
    updates
  );

  // Clear products cache
  apiClient.clearCache("/products");

  return data;
}

/**
 * Delete a product
 * CACHING: DELETE never cached. Clears products cache.
 */
export async function deleteProduct(id) {
  const data = await apiClient.delete(
    `${API_BASE}/inventory/v1/products/${id}`
  );

  // Clear products cache
  apiClient.clearCache("/products");

  return data;
}

/**
 * Update product stock
 * CACHING: PATCH never cached. Clears products cache.
 */
export async function updateStock(id, stockData) {
  const data = await apiClient.patch(
    `${API_BASE}/inventory/v1/products/${id}/stock`,
    stockData
  );

  // Clear products cache
  apiClient.clearCache("/products");

  return data;
}

/**
 * Search products
 * CACHING: Search results not cached (real-time)
 */
export async function searchProducts(query) {
  return apiClient.get(`${API_BASE}/inventory/v1/products/search`, {
    params: { q: query },
    cache: { ttl: 0, noStore: true }, // Real-time search
  });
}

export default {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  searchProducts,
};
