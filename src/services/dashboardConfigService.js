import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : {};

export async function getDashboardConfig(companyId) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const res = await axios.get(`${API_BASE}/inventory/v1/dashboard-config/${companyId}`, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function updateDashboardConfig(companyId, payload) {
    try {
        const res = await axios.put(`${API_BASE}/inventory/v1/dashboard-config/${companyId}`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export default { getDashboardConfig, updateDashboardConfig };
