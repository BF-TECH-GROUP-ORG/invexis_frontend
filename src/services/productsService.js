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
} = {}) {
  if (!companyId) return [];

  const params = { page, limit };
  if (category) params.category = category;
  if (search) params.search = search;

  return apiClient.get(`${INVENTORY_BASE}/companies/${companyId}/products`, {
    params,

    cache: { noStore: true },
  });
}

/**
 * -----------------------------------------------------
 * Featured products
 * -----------------------------------------------------
 */
export async function getFeaturedProducts() {
  const cache = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${INVENTORY_BASE}/products/featured`, {
    cache,
  });
}

/**
 * -----------------------------------------------------
 * Product by ID
 * -----------------------------------------------------
 */
export async function getProductById(id) {
  if (!id) throw new Error("Product ID is required");

  const cache = getCacheStrategy("INVENTORY", "METADATA");

  return apiClient.get(`${INVENTORY_BASE}/products/${id}`, {
    cache,
  });
}

/**
 * -----------------------------------------------------
 * Create product
 * -----------------------------------------------------
 */
export async function createProduct(payload) {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const data = await apiClient.post(
    `${INVENTORY_BASE}/products`,
    payload,

    {
      // Headers will be automatically set by the browser/axios for FormData
    }
  );

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Update product
 * -----------------------------------------------------
 */
export async function updateProduct(id, updates) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.put(`${INVENTORY_BASE}/products/${id}`, updates);

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Delete product
 * -----------------------------------------------------
 */
export async function deleteProduct(id) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.delete(`${INVENTORY_BASE}/products/${id}`);

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Update stock
 * -----------------------------------------------------
 */
export async function updateStock(id, stockData) {
  if (!id) throw new Error("Product ID is required");

  const data = await apiClient.patch(
    `${INVENTORY_BASE}/products/${id}/stock`,
    stockData
  );

  apiClient.clearCache("/inventory");
  return data;
}

/**
 * -----------------------------------------------------
 * Search products (real-time)
 * -----------------------------------------------------
 */
export async function searchProducts(query) {
  if (!query) return [];

  return apiClient.get(`${INVENTORY_BASE}/products/search`, {
    params: { q: query },

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
