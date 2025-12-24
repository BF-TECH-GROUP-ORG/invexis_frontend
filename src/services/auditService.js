import apiClient from "@/lib/apiClient";

const AUDIT_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAuditLogs = async (companyId, params = {}, options = {}) => {
    try {
        const queryParams = new URLSearchParams({
            companyId,
            ...params
        }).toString();

        const url = `${AUDIT_URL}/audit/logs?${queryParams}`;
        const response = await apiClient.get(url, options);
        console.log('logs for all company', response);
        return response;
    } catch (error) {
        console.error('Failed to fetch audit logs:', error.message);
        return [];
    }
};
