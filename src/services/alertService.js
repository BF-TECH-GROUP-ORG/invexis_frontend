import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all alerts for a company
 * GET /v1/alerts/company/:companyId
 */
export async function getAlerts({ companyId, page = 1, limit = 20, type, priority, status }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const params = { page, limit };
        if (type) params.type = type;
        if (priority) params.priority = priority;
        if (status) params.status = status;

        const data = await apiClient.get(`${API_BASE}/inventory/v1/alerts/company/${companyId}`, {
            params
        });
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get a single alert by ID
 * GET /v1/alerts/:id
 */
export async function getAlertById(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/alerts/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Create a new alert
 * POST /v1/alerts
 */
export async function createAlert(payload) {
    try {
        const data = await apiClient.post(`${API_BASE}/inventory/v1/alerts`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Update an alert
 * PUT /v1/alerts/:id
 */
export async function updateAlert(id, updates) {
    try {
        const data = await apiClient.put(`${API_BASE}/inventory/v1/alerts/${id}`, updates);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete an alert
 * DELETE /v1/alerts/:id
 */
export async function deleteAlert(id) {
    try {
        const data = await apiClient.delete(`${API_BASE}/inventory/v1/alerts/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Resolve an alert
 * PATCH /v1/alerts/:id/resolve
 */
export async function resolveAlert(id) {
    try {
        const data = await apiClient.patch(`${API_BASE}/inventory/v1/alerts/${id}/resolve`, {});
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Mark alert as read
 * PATCH /v1/alerts/:id/read
 */
export async function markAlertAsRead(id) {
    try {
        const data = await apiClient.patch(`${API_BASE}/inventory/v1/alerts/${id}/read`, {});
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Mark all alerts as read
 * PATCH /v1/alerts/company/:companyId/read-all
 */
export async function markAllAlertsAsRead(companyId) {
    try {
        const data = await apiClient.patch(`${API_BASE}/inventory/v1/alerts/company/${companyId}/read-all`, {});
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get alert settings for a company
 * GET /v1/alerts/settings/:companyId
 */
export async function getAlertSettings(companyId) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/alerts/settings/${companyId}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Update alert settings
 * PUT /v1/alerts/settings/:companyId
 */
export async function updateAlertSettings(companyId, settings) {
    try {
        const data = await apiClient.put(`${API_BASE}/inventory/v1/alerts/settings/${companyId}`, settings);
        return data;
    } catch (err) {
        throw err;
    }
}

export default {
    getAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    resolveAlert,
    markAlertAsRead,
    markAllAlertsAsRead,
    getAlertSettings,
    updateAlertSettings
};
    