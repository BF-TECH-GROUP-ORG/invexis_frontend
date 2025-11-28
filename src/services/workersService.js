import axios from '@/lib/axios';

const WORKERS_URL = process.env.NEXT_PUBLIC_WORKERS_API_URL || '';
const COMPANIES_URL = process.env.NEXT_PUBLIC_COMPANIES_API_URL || '';

// Helper to ensure URL is set
const ensureUrl = (url, name) => {
    if (!url) {
        console.warn(`${name} is not set. API calls will be skipped.`);
        return null;
    }
    return url;
};

// =======================================
// WORKERS CRUD OPERATIONS
// =======================================

export const getAllWorkers = async () => {
    const url = ensureUrl(WORKERS_URL, 'WORKERS_URL');
    if (!url) return [];
    try {
        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Workers fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch workers:', error.message);
        return [];
    }
};

export const getSingleWorker = async (workerId) => {
    try {
        const response = await axios.get(`${WORKERS_URL}/${workerId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Single worker fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch worker:', error.message);
        return null;
    }
};

const AUTH_URL = process.env.NEXT_PUBLIC_WORKERSAUTH_API_URL || '';

export const createWorker = async (workerData) => {
    const url = ensureUrl(AUTH_URL, 'AUTH_URL');
    if (!url) throw new Error('AUTH_URL not set');

    try {
        const response = await axios.post(`${url}register`, workerData, {
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

export const updateWorker = async (workerId, updateData) => {
    try {
        const response = await axios.put(`${WORKERS_URL}/${workerId}`, updateData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
        console.log("Worker updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update worker:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteWorker = async (workerId) => {
    try {
        const response = await axios.delete(`${WORKERS_URL}/${workerId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Worker deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete worker:', error.response?.data || error.message);
        throw error;
    }
};

// =======================================
// COMPANIES/BRANCHES CRUD OPERATIONS
// =======================================

export const getAllCompanies = async () => {
    const url = ensureUrl(COMPANIES_URL, 'COMPANIES_URL');
    if (!url) return null;
    try {
        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Companies fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch companies:', error.message);
        return null;
    }
};

export const getSingleCompany = async (companyId) => {
    const url = ensureUrl(COMPANIES_URL, 'COMPANIES_URL');
    if (!url) return null;
    try {
        const response = await axios.get(`${url}/${companyId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Single company fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch company:', error.message);
        return null;
    }
};

export const createCompany = async (companyData) => {
    const url = ensureUrl(COMPANIES_URL, 'COMPANIES_URL');
    if (!url) throw new Error('COMPANIES_URL not set');
    try {
        const response = await axios.post(url, companyData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
        console.log("Company created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create company:', error.response?.data || error.message);
        throw error;
    }
};

export const updateCompany = async (companyId, updateData) => {
    const url = ensureUrl(COMPANIES_URL, 'COMPANIES_URL');
    if (!url) throw new Error('COMPANIES_URL not set');
    try {
        const response = await axios.put(`${url}/${companyId}`, updateData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
        console.log("Company updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to update company:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteCompany = async (companyId) => {
    const url = ensureUrl(COMPANIES_URL, 'COMPANIES_URL');
    if (!url) throw new Error('COMPANIES_URL not set');
    try {
        const response = await axios.delete(`${url}/${companyId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Company deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete company:', error.response?.data || error.message);
        throw error;
    }
};

// =======================================
// ADDITIONAL HELPER FUNCTIONS
// =======================================

export const getWorkersByCompany = async (companyId) => {
    try {
        const response = await axios.get(`${COMPANIES_URL}/${companyId}/workers`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Workers by company fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch workers by company:', error.message);
        return [];
    }
};

export const assignWorkerToCompany = async (workerId, companyId) => {
    try {
        const response = await axios.post(`${WORKERS_URL}/${workerId}/assign`,
            { companyId },
            {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Worker assigned to company:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to assign worker:', error.response?.data || error.message);
        throw error;
    }
};

export const getWorkersByCompanyId = async (companyId) => {
    // Construct URL: replace 'company-user/' with 'company-users/company/{companyId}'
    // WORKERS_URL is expected to be .../api/company/company-user/
    const baseUrl = WORKERS_URL.endsWith('company-user/')
        ? WORKERS_URL.replace('company-user/', '')
        : WORKERS_URL;

    // Ensure no double slashes if WORKERS_URL didn't end with company-user/ for some reason
    // But based on .env it does. 
    // Target: .../api/company/company-users/company/{companyId}

    const url = `${baseUrl}company-users/company/${companyId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Workers by company ID fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch workers by company ID:', error.message);
        return [];
    }
};
