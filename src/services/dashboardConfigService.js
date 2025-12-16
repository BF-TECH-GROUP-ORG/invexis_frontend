import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardConfig(companyId) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const data = await apiClient.get(`${API_BASE}/inventory/v1/dashboard-config/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function updateDashboardConfig(companyId, payload) {
    try {
        const data = await apiClient.put(`${API_BASE}/inventory/v1/dashboard-config/${companyId}`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

export default { getDashboardConfig, updateDashboardConfig };
