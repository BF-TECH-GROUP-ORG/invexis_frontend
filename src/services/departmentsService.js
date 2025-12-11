const { default: axios } = require("axios");

const DEPARTMENTS_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to ensure URL is set
const ensureUrl = (url, name) => {
    if (!url) {
        console.warn(`${name} is not set. API calls will be skipped.`);
        return null;
    }
    return url;
};

/**
 * Get all departments for a specific company
 * @param {string} companyId - The company ID
 * @returns {Promise<Array>} - List of departments
 */
export const getDepartmentsByCompany = async (companyId) => {
    try {
        if (!DEPARTMENTS_URL) {
            throw new Error('API URL is not configured. Please check NEXT_PUBLIC_API_URL environment variable.');
        }

        if (!companyId) {
            throw new Error('Company ID is required');
        }

        const url = `${DEPARTMENTS_URL}/company/companies/${companyId}/departments`;
        console.log("Fetching departments from:", url);

        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });

        console.log("Departments fetched successfully:", response.data);

        // Handle different response structures
        return response.data.departments || response.data.data || response.data || [];
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch departments';
        console.error('Failed to fetch departments:', {
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        // Return empty array instead of throwing to allow form to work even if API fails
        return [];
    }
};

/**
 * Get department by ID
 * @param {string} departmentId - The department ID
 * @param {string} companyId - Optional company ID for verification
 * @returns {Promise<Object>} - Department details
 */
export const getDepartmentById = async (departmentId, companyId = null) => {
    try {
        if (!DEPARTMENTS_URL) {
            throw new Error('API URL is not configured.');
        }

        const url = `${DEPARTMENTS_URL}/company/departments/${departmentId}${companyId ? `?companyId=${companyId}` : ''}`;

        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });

        return response.data.department || response.data;
    } catch (error) {
        console.error('Failed to fetch department:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get department statistics
 * @param {string} departmentId - The department ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Department statistics
 */
export const getDepartmentStats = async (departmentId, companyId) => {
    try {
        if (!DEPARTMENTS_URL) {
            throw new Error('API URL is not configured.');
        }

        const url = `${DEPARTMENTS_URL}/company/departments/${departmentId}/stats?companyId=${companyId}`;

        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to fetch department stats:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update department details
 * @param {string} departmentId - The department ID
 * @param {Object} departmentData - Updated department data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Updated department
 */
export const updateDepartment = async (departmentId, departmentData, token) => {
    try {
        if (!DEPARTMENTS_URL) {
            throw new Error('API URL is not configured.');
        }

        const url = `${DEPARTMENTS_URL}/company/departments/${departmentId}`;

        const response = await axios.put(url, departmentData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to update department:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Change department status
 * @param {string} departmentId - The department ID
 * @param {string} status - New status (active/inactive)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Updated department
 */
export const changeDepartmentStatus = async (departmentId, status, token) => {
    try {
        if (!DEPARTMENTS_URL) {
            throw new Error('API URL is not configured.');
        }

        const url = `${DEPARTMENTS_URL}/company/departments/${departmentId}/status`;

        const response = await axios.patch(url, { status }, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to change department status:', error.response?.data || error.message);
        throw error;
    }
};
