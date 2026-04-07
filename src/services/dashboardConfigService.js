import apiClient from "@/lib/apiClient";



export async function getDashboardConfig(companyId) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const data = await apiClient.get(`/inventory/v1/dashboard-config/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function updateDashboardConfig(companyId, payload) {
    try {
        const data = await apiClient.put(`/inventory/v1/dashboard-config/${companyId}`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

const dashboardConfigService = { getDashboardConfig, updateDashboardConfig };

export default dashboardConfigService;
