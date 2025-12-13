import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

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

        const res = await axios.get(`${API_BASE}/inventory/v1/alerts/company/${companyId}`, {
            params,
            headers: defaultHeaders
        });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/alerts/${id}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.post(`${API_BASE}/inventory/v1/alerts`, payload, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.put(`${API_BASE}/inventory/v1/alerts/${id}`, updates, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.delete(`${API_BASE}/inventory/v1/alerts/${id}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.patch(`${API_BASE}/inventory/v1/alerts/${id}/resolve`, {}, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.patch(`${API_BASE}/inventory/v1/alerts/${id}/read`, {}, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.patch(`${API_BASE}/inventory/v1/alerts/company/${companyId}/read-all`, {}, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.get(`${API_BASE}/inventory/v1/alerts/settings/${companyId}`, { headers: defaultHeaders });
        return res.data;
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
        const res = await axios.put(`${API_BASE}/inventory/v1/alerts/settings/${companyId}`, settings, { headers: defaultHeaders });
        return res.data;
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
