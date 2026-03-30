import apiClient from "@/lib/apiClient";

let API_BASE;

export async function getOrganization(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/company/companies/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function updateOrganization(id, payload) {
    try {
        const data = await apiClient.put(`${API_BASE}/company/companies/${id}`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

const organizationService = { getOrganization, updateOrganization };

export default organizationService;
