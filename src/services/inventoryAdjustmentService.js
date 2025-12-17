import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getAdjustments({ companyId, page = 1, limit = 20 }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const data = await apiClient.get(`${API_BASE}/inventory/v1/inventory-adjustments/company/${companyId}`, {
            params: { page, limit }
        });
        return data;
    } catch (err) {
        throw err;
    }
}

export async function createAdjustment(payload) {
    try {
        const data = await apiClient.post(`${API_BASE}/inventory/v1/inventory-adjustments`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function getAdjustmentById(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/inventory-adjustments/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export default { getAdjustments, createAdjustment, getAdjustmentById };
