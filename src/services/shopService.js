import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const SHOP_API_URL = process.env.NEXT_PUBLIC_BRANCHES_API_URL;

/**
 * Get all shops
 * CACHING: Shops cached for 1 hour (long revalidate)
 */
export const getAllShops = async () => {
  const cacheStrategy = getCacheStrategy("SHOPS");

  try {
    const data = await apiClient.get(SHOP_API_URL, {
      cache: cacheStrategy,
    });

    console.log("Shops fetched:", data);

    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && Array.isArray(data.shops)) {
      return data.shops;
    }

    console.warn("Unexpected API response structure:", data);
    return [];
  } catch (error) {
    // Only log warnings in development for 404 errors
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch shops:", error.message);
    }
    return [];
  }
};

/**
 * Delete a shop
 * CACHING: DELETE never cached. Clears shops cache.
 */
export const deleteShop = async (shopId) => {
  try {
    const data = await apiClient.delete(`${SHOP_API_URL}/${shopId}`);

    // Clear shops cache
    apiClient.clearCache("/shops");
    apiClient.clearCache("/branches"); // In case URL contains branches

    console.log("Shop deleted successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to delete shop:", error.message);
    throw error;
  }
};

/**
 * Create a shop
 * CACHING: POST never cached. Clears shops cache.
 */
export const createShop = async (shopData) => {
  try {
    const data = await apiClient.post(SHOP_API_URL, shopData);

    // Clear shops cache
    apiClient.clearCache("/shops");
    apiClient.clearCache("/branches");

    console.log("Shop created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create shop:", error.message);
    throw error;
  }
};

export default {
  getAllShops,
  createShop,
  deleteShop,
};
