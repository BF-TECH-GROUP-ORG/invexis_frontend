import apiClient from "@/lib/apiClient";



export const getAuditLogs = async (companyId, params = {}, options = {}) => {
    try {
        const queryParams = new URLSearchParams({
            companyId,
            ...params
        }).toString();

        const url = `/audit/logs?${queryParams}`;
        const response = await apiClient.get(url, options);

        return response;
    } catch (error) {
        console.error('Failed to fetch audit logs:', error.message);
        return [];
    }
};
