const { default: axios } = require("axios");
const WORKERS_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to ensure URL is set
const ensureUrl = (url, name) => {
    if (!url) {
        console.warn(`${name} is not set. API calls will be skipped.`);
        return null;
    }
    return url;
};




const AUTH_URL = WORKERS_URL

export const createWorker = async (workerData) => {
    try {
        const response = await axios.post(`${AUTH_URL}/auth/register`, workerData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
        console.log("Worker created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create worker:', error.response?.data || error.message);
        throw error;
    }
};






// Cache object to store fetched shops by companyId
const shopsCache = {};

export const getWorkersByCompanyId = async (companyId, token) => {

    try {
        const url = `${AUTH_URL}/auth/company/${companyId}/workers`
        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("Workers by company fetched:", response.data);
        return response.data.workers;
    } catch (error) {
        console.log('Failed to fetch workers by company:', error.message);
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
        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Shops by company fetched:", response.data);
        const shops = response.data.shops || response.data || [];
        shopsCache[companyId] = shops;
        return shops;
    } catch (error) {
        console.error('Failed to fetch shops by company:', error.message);
        return [];
    }
};

export const deleteWorker = async (workerId, companyId, token) => {
    try {
        const url = `${WORKERS_URL}/auth/company/${companyId}/workers/${workerId}`;
        const response = await axios.delete(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("Worker deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete worker:', error.response?.data || error.message);
        throw error;
    }
};

export const updateWorker = async (workerId, workerData, token) => {
    try {
        // Note: Adjust endpoint if needed based on backend API
        const response = await axios.put(`${AUTH_URL}/auth/users/${workerId}`, workerData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log("Worker updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update worker:', error.response?.data || error.message);
        throw error;
    }
};

export const getWorkerById = async (workerId, token) => {
    try {
        if (!AUTH_URL) {
            throw new Error('API URL is not configured. Please check NEXT_PUBLIC_API_URL environment variable.');
        }

        if (!token) {
            throw new Error('Authentication token is required');
        }

        const url = `${AUTH_URL}/auth/users/${workerId}`;
        console.log("Fetching worker from:", url);

        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log("Worker fetched successfully:", response.data);

        // Return the user data, handling different response structures
        return response.data.user || response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
        console.error('Failed to fetch worker:', {
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw new Error(errorMessage);
    }
};
