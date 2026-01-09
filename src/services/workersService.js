import apiClient from "@/lib/apiClient";

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
        console.log('payload is' + workerData)
        console.log('response is' + response)
        return response;
    } catch (error) {
        console.error('Failed to create worker:', error.message);
        throw error;
    }
};

// Cache object to store fetched shops by companyId
const shopsCache = {};

export const getWorkersByCompanyId = async (companyId, options = {}) => {
    try {
        const url = `${AUTH_URL}/auth/company/${companyId}/workers`;
        console.log(`Fetching workers from: ${url}`);
        const response = await apiClient.get(url, options);
        console.log("Workers API Raw Response:", response);

        // Handle different possible response structures
        if (Array.isArray(response)) return response;
        if (response.workers && Array.isArray(response.workers)) return response.workers;
        if (response.data && Array.isArray(response.data)) return response.data;

        console.warn("Unexpected workers response structure:", response);
        return response.workers || [];
    } catch (error) {
        console.error('Failed to fetch workers by company:', error);
        return [];
    }
};

export const getShopsByCompanyId = async (companyId) => {
    if (!companyId) return [];

    // Check cache first
    if (shopsCache[companyId]) {
        console.log("Returning cached shops for company:", companyId);
        return shopsCache[companyId];
    }

    try {
        const url = `${WORKERS_URL}/auth/company/${companyId}/shops`;
        console.log(`Fetching shops from: ${url}`);
        const response = await apiClient.get(url);
        console.log("Shops API Raw Response:", response);
        
        let shops = [];
        if (Array.isArray(response)) shops = response;
        else if (response.shops && Array.isArray(response.shops)) shops = response.shops;
        else if (response.data && Array.isArray(response.data)) shops = response.data;
        else {
             console.warn("Unexpected shops response structure:", response);
             shops = response.shops || [];
        }

        shopsCache[companyId] = shops;
        return shops;
    } catch (error) {
        console.error('Failed to fetch shops by company:', error);
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
    }


}


