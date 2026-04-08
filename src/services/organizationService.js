import apiClient from "@/lib/apiClient";


export async function getOrganization(id) {
    try {
        const data = await apiClient.get(`/company/companies/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function updateOrganization(id, payload) {
    try {
        const data = await apiClient.put(`/company/companies/${id}`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

export async function getCompanyAssets(companyId, params = {}) {
    try {
        const data = await apiClient.get(`/inventory/v1/companies/${companyId}/assets`, { params });
        return data;
    } catch (err) {
        throw err;
    }
}

export async function getCompanyAssetReport(companyId, params = {}) {
    try {
        const data = await apiClient.get(`/inventory/v1/companies/${companyId}/assets/report`, { 
            params: { ...params, companyId } 
        });
        return data;
    } catch (err) {
        throw err;
    }
}

const organizationService = { getOrganization, updateOrganization, getCompanyAssets, getCompanyAssetReport };

export default organizationService;
