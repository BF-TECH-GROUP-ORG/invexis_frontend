import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : {};

export async function getAdjustments({ companyId, page = 1, limit = 20 }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const res = await axios.get(`${API_BASE}/inventory/v1/inventory-adjustments/company/${companyId}`, {
            params: { page, limit },
            headers: defaultHeaders
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function createAdjustment(payload) {
    try {
        const res = await axios.post(`${API_BASE}/inventory/v1/inventory-adjustments`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function getAdjustmentById(id) {
    try {
        const res = await axios.get(`${API_BASE}/inventory/v1/inventory-adjustments/${id}`, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export default { getAdjustments, createAdjustment, getAdjustmentById };
