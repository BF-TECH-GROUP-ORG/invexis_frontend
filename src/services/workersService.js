import apiClient from "@/lib/apiClient";
<<<<<<< HEAD
import { getCacheStrategy } from "@/lib/cacheConfig";

const WORKERS_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_URL = WORKERS_BASE_URL; // Using same base URL as per original file structure

export const createWorker = async (workerData) => {
  try {
    const response = await apiClient.post(
      `${AUTH_URL}/auth/register`,
      workerData
    );
    console.log("Worker created successfully:", response);

    // Invalidate workers cache
    apiClient.clearCache(`${AUTH_URL}/auth/company`);

    return response;
  } catch (error) {
    console.error(
      "Failed to create worker:",
      error.response?.data || error.message
    );
    throw error;
  }
=======

const WORKERS_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_URL = WORKERS_URL;

// Helper to ensure URL is set
const ensureUrl = (url, name) => {
    if (!url) {
        console.warn(`${name} is not set. API calls will be skipped.`);
        return null;
    }
    return url;
};

export const createWorker = async (workerData) => {
    try {
        const response = await apiClient.post(`${AUTH_URL}/auth/register`, workerData);
        console.log("Worker created successfully:", response);
        return response;
    } catch (error) {
        console.error('Failed to create worker:', error.message);
        throw error;
    }
>>>>>>> 7cad349aeae0f71ae0cc44e1be7c2bf6538737d0
};

// Cache object to store fetched shops by companyId
const shopsCache = {};

export const getWorkersByCompanyId = async (companyId) => {
<<<<<<< HEAD
  try {
    const url = `${AUTH_URL}/auth/company/${companyId}/workers`;
    const cacheStrategy = getCacheStrategy("STAFF");

    const response = await apiClient.get(url, {
      cache: cacheStrategy,
    });
    console.log("Workers by company fetched:", response);
    return response.workers;
  } catch (error) {
    console.log("Failed to fetch workers by company:", error.message);
    return [];
  }
=======
    try {
        const url = `${AUTH_URL}/auth/company/${companyId}/workers`;
        const response = await apiClient.get(url);
        console.log("Workers by company fetched:", response);
        return response.workers;
    } catch (error) {
        console.log('Failed to fetch workers by company:', error.message);
        return [];
    }
>>>>>>> 7cad349aeae0f71ae0cc44e1be7c2bf6538737d0
};

export const getShopsByCompanyId = async (companyId) => {
  if (!companyId) return [];

  // Check cache first
  if (shopsCache[companyId]) {
    console.log("Returning cached shops for company:", companyId);
    return shopsCache[companyId];
  }

<<<<<<< HEAD
  try {
    const url = `${WORKERS_BASE_URL}/auth/company/${companyId}/shops`;
    const cacheStrategy = getCacheStrategy("SHOPS");

    const response = await apiClient.get(url, {
      cache: cacheStrategy,
    });
    console.log("Shops by company fetched:", response);
    const shops = response.shops || response || [];
    shopsCache[companyId] = shops;
    return shops;
  } catch (error) {
    console.error("Failed to fetch shops by company:", error.message);
    return [];
  }
};

export const deleteWorker = async (workerId, companyId) => {
  try {
    const url = `${WORKERS_BASE_URL}/auth/company/${companyId}/workers/${workerId}`;
    const response = await apiClient.delete(url);
    console.log("Worker deleted successfully:", response);

    // Invalidate workers cache
    apiClient.clearCache(`${AUTH_URL}/auth/company`);

    return response;
  } catch (error) {
    console.error(
      "Failed to delete worker:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateWorker = async (workerId, workerData) => {
  try {
    const response = await apiClient.put(
      `${AUTH_URL}/auth/users/${workerId}`,
      workerData
    );
    console.log("Worker updated successfully:", response);

    // Invalidate workers cache
    apiClient.clearCache(`${AUTH_URL}/auth/company`);
    // Also invalidate specific worker detail if cached
    apiClient.clearCache(`${AUTH_URL}/auth/users/${workerId}`);

    return response;
  } catch (error) {
    console.error(
      "Failed to update worker:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getWorkerById = async (workerId) => {
  try {
    if (!AUTH_URL) {
      throw new Error(
        "API URL is not configured. Please check NEXT_PUBLIC_API_URL environment variable."
      );
=======
    try {
        const url = `${WORKERS_URL}/auth/company/${companyId}/shops`;
        const response = await apiClient.get(url);
        console.log("Shops by company fetched:", response);
        const shops = response.shops || response || [];
        shopsCache[companyId] = shops;
        return shops;
    } catch (error) {
        console.error('Failed to fetch shops by company:', error.message);
        return [];
    }
};

export const deleteWorker = async (workerId, companyId) => {
    try {
        const url = `${WORKERS_URL}/auth/company/${companyId}/workers/${workerId}`;
        const response = await apiClient.delete(url);
        console.log("Worker deleted successfully:", response);
        return response;
    } catch (error) {
        console.error('Failed to delete worker:', error.message);
        throw error;
    }
};

export const updateWorker = async (workerId, workerData) => {
    try {
        // Note: Adjust endpoint if needed based on backend API
        const response = await apiClient.put(`${AUTH_URL}/auth/users/${workerId}`, workerData);
        console.log("Worker updated successfully:", response);
        return response;
    } catch (error) {
        console.error('Failed to update worker:', error.message);
        throw error;
    }
};

export const getWorkerById = async (workerId) => {
    try {
        if (!AUTH_URL) {
            throw new Error('API URL is not configured. Please check NEXT_PUBLIC_API_URL environment variable.');
        }

        const url = `${AUTH_URL}/auth/users/${workerId}`;
        console.log("Fetching worker from:", url);

        const response = await apiClient.get(url);
        console.log("Worker fetched successfully:", response);

        // Return the user data, handling different response structures
        return response.user || response;
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        console.error('Failed to fetch worker:', {
            message: errorMessage,
            url: `${AUTH_URL}/auth/users/${workerId}`
        });
        throw new Error(errorMessage);
>>>>>>> 7cad349aeae0f71ae0cc44e1be7c2bf6538737d0
    }

    const url = `${AUTH_URL}/auth/users/${workerId}`;
    console.log("Fetching worker from:", url);

    // Use STAFF strategy but maybe shorter? Reusing STAFF (1 hour) for consistency, relying on clearCache on update.
    const cacheStrategy = getCacheStrategy("STAFF");

    const response = await apiClient.get(url, {
      cache: cacheStrategy,
    });
    console.log("Worker fetched successfully:", response);

    // Return the user data, handling different response structures
    return response.user || response;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred";
    console.error("Failed to fetch worker:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw new Error(errorMessage);
  }
};

