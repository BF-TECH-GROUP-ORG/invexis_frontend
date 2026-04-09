import apiClient from "@/lib/apiClient";



export const createWorker = async (workerData, options = {}) => {
    try {
        const response = await apiClient.post(`/auth/register`, workerData, options);
        apiClient.clearCache("workers");

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
        if (!companyId) return [];
        const url = `/auth/company/${companyId}/workers`;


        // Merge options to include headers if provided
        const config = {
            ...options
        };

        const response = await apiClient.get(url, {
            ...config,
            cache: { ttl: 60 * 60 * 1000 } // Extended TTL for service layer cache
        });


        const responseData = response.data || response;

        // Handle different possible response structures robustly
        if (Array.isArray(responseData)) return responseData;
        if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
        if (responseData.workers && Array.isArray(responseData.workers)) return responseData.workers;
        if (responseData.users && Array.isArray(responseData.users)) return responseData.users;

        console.warn("Unexpected workers response structure:", responseData);
        return [];
    } catch (error) {
        console.error('Failed to fetch workers by company:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

export const getShopsByCompanyId = async (companyId, options = {}) => {
    if (!companyId) return [];

    // Check cache first


    try {
        const url = `/auth/company/${companyId}/shops`;


        // Axios response.data contains the actual response body
        const responseData = response.data || response;

        let shops = [];
        if (Array.isArray(responseData)) shops = responseData;
        else if (responseData.shops && Array.isArray(responseData.shops)) shops = responseData.shops;
        else if (responseData.data && Array.isArray(responseData.data)) shops = responseData.data;
        else {
            console.warn("Unexpected shops response structure:", responseData);
            shops = Array.isArray(responseData) ? responseData : (responseData.shops || []);
        }

        shopsCache[companyId] = shops;
        return shops;
    } catch (error) {
        console.error('Failed to fetch shops by company:', error);
        return [];
    }
};

export const deleteWorker = async (workerId, companyId, options = {}) => {
    try {
        const url = `/auth/company/${companyId}/workers/${workerId}`;
        const response = await apiClient.delete(url, options);
        apiClient.clearCache("workers");

        return response;
    } catch (error) {
        console.error('Failed to delete worker:', error.message);
        throw error;
    }
};

export const updateWorker = async (workerId, workerData, options = {}) => {
    try {
        // Note: Adjust endpoint if needed based on backend API
        const response = await apiClient.put(`/auth/users/${workerId}`, workerData, options);
        apiClient.clearCache("workers");

        return response;
    } catch (error) {
        console.error('Failed to update worker:', error.message);
        throw error;
    }
};

export const getWorkerById = async (workerId, options = {}) => {
    try {
        const response = await apiClient.get(`/auth/users/${workerId}`, options);
        const responseData = response.data || response;
        return responseData.user || responseData;
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        console.error('Failed to fetch worker:', { message: errorMessage });
        throw new Error(errorMessage);
    }
}


