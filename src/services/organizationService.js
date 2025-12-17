import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getOrganization(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/organizations/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function updateOrganization(id, payload) {
    try {
        const data = await apiClient.put(`${API_BASE}/inventory/v1/organizations/${id}`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

export default { getOrganization, updateOrganization };
