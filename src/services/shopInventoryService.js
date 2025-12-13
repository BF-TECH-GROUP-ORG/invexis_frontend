import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : {};

export async function getShopInventory({ shopId, page = 1, limit = 20 }) {
    try {
        if (!shopId) throw new Error("Shop ID is required");
        const res = await axios.get(`${API_BASE}/inventory/v1/shop-inventory/shop/${shopId}`, {
            params: { page, limit },
            headers: defaultHeaders
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function updateShopInventory(id, payload) {
    try {
        const res = await axios.put(`${API_BASE}/inventory/v1/shop-inventory/${id}`, payload, { headers: defaultHeaders });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export default { getShopInventory, updateShopInventory };
