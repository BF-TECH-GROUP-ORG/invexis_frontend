import apiClient from "@/lib/apiClient";



export async function getAdjustments({ companyId, page = 1, limit = 20 }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const data = await apiClient.get(`/inventory/v1/inventory-adjustments/company/${companyId}`, {
            params: { page, limit }
        });
        return data;
    } catch (err) {
        throw err;
    }
}

export async function createAdjustment(payload) {
    try {
        const data = await apiClient.post(`/inventory/v1/inventory-adjustments`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function getAdjustmentById(id) {
    try {
        const data = await apiClient.get(`/inventory/v1/inventory-adjustments/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

const inventoryAdjustmentService = { getAdjustments, createAdjustment, getAdjustmentById };

export default inventoryAdjustmentService;
