import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

// Prefer a local proxy base when available (NEXT_PUBLIC_API_URL), otherwise use the explicit inventory API URL.
// This mirrors productsService so local dev can set `NEXT_PUBLIC_API_URL=/api` and avoid CORS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (typeof window !== "undefined") {
  console.info("CategoriesService: using API base ->", API_BASE);
}

/**
 * Get company details by ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company data
 *
 * CACHING: Organization data cached for 1 hour (semi-static)
 */
export async function getCompanyId(companyId, options = {}) {
  if (!companyId)
    throw new Error("Company ID is required to fetch company details");

  const cacheStrategy = getCacheStrategy("ORGANIZATION");

  const data = await apiClient.get(
    `${API_BASE}/company/companies/${companyId}`,
    {
      cache: cacheStrategy,
      ...options,
    }
  );

  console.log("received data", data);
  return data;
}

/**
 * Get parent categories for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Categories data
 *
 * CACHING: Categories cached for 30 minutes (semi-static, updated infrequently)
 */
export async function ParentCategories(companyId, options = {}) {
  console.log("ParentCategories service called with:", companyId);

  const companyData = await getCompanyId(companyId, options);
  const categoryIds = companyData?.data?.category_ids || [];

  if (!categoryIds.length) {
    return { data: [] };
  }

  const cacheStrategy = getCacheStrategy("CATEGORIES");

  const data = await apiClient.post(
    `${API_BASE}/inventory/v1/categories/by-ids`,
    { ids: categoryIds },
    { cache: cacheStrategy, ...options }
  );

  console.log("received data", data);
  return data;
}

/**
 * Get all level 3 categories for a company
 * @param {Object} params - Request parameters
 * @param {string} params.companyId - Company ID
 * @returns {Promise<Object>} Categories data
 *
 * CACHING: Categories cached for 30 minutes
 */
export async function getCategories(params = {}, options = {}) {
  const { companyId } = params;
  if (!companyId) throw new Error("Company ID is required");

  const cacheStrategy = getCacheStrategy("CATEGORIES");

  return apiClient.get(
    `${API_BASE}/inventory/v1/categories/company/${companyId}/level3`,
    {
      params,
      cache: cacheStrategy,
      ...options,
    }
  );
}

/**
 * Create a new category
 * @param {Object} payload - Category data
 * @param {string} payload.companyId - Company ID
 * @returns {Promise<Object>} Created category data
 *
 * CACHING: POST request - never cached. Clears categories cache after creation.
 */
export async function createCategory(payload) {
  const { companyId } = payload;
  if (!companyId) throw new Error("Company ID is required for creation");

  const data = await apiClient.post(
    `${API_BASE}/inventory/v1/categories/company/${companyId}/level3`,
    payload
  );

  // Clear categories cache since we modified data
  apiClient.clearCache("/categories");

  return data;
}

/**
 * Update an existing category
 * @param {string} id - Category ID
 * @param {Object} updates - Category updates
 * @returns {Promise<Object>} Updated category data
 *
 * CACHING: PUT request - never cached. Clears categories cache after update.
 */
export async function updateCategory(id, updates) {
  const data = await apiClient.put(
    `${API_BASE}/inventory/v1/categories/${id}`,
    updates
  );

  // Clear categories cache since we modified data
  apiClient.clearCache("/categories");

  return data;
}

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Deletion response
 *
 * CACHING: DELETE request - never cached. Clears categories cache after deletion.
 */
export async function deleteCategory(id) {
  const data = await apiClient.delete(
    `${API_BASE}/inventory/v1/categories/${id}`
  );

  // Clear categories cache since we modified data
  apiClient.clearCache("/categories");

  return data;
}

/**
 * Get category with parent hierarchy
 * @param {string} id - Level 3 Category ID
 * @returns {Promise<Object>} Category hierarchy data
 *
 * CACHING: Category hierarchy cached for 1 hour
 */
export async function getCategoryWithParent(id, options = {}) {
  const cacheStrategy = getCacheStrategy("CATEGORIES");

  return apiClient.get(
    `${API_BASE}/inventory/v1/categories/level3/${id}/with-parent`,
    {
      cache: cacheStrategy,
      ...options,
    }
  );
}

const categoriesService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  ParentCategories,
  getCompanyId,
  getCategoryWithParent,
};

export default categoriesService;
