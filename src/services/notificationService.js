import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/notifications";

/**
 * Get User Notifications
 * GET /api/notifications
 * @param {Object} params
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 50)
 * @param {boolean} params.unreadOnly - Filter unread items
 * @param {string} params.role - Filter by user role
 * @param {string} params.companyId - Filter by company context
 * @param {string} params.type - Filter by notification type
 */
export async function getNotifications({ page = 1, limit = 50, unreadOnly, role, companyId, type } = {}) {
    try {
        const params = { page, limit };
        if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
        if (role) params.role = role;
        if (companyId) params.companyId = companyId;
        if (type) params.type = type;

        const response = await apiClient.get(API_BASE, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

/**
 * Mark Notifications as Read
 * POST /api/notifications/mark-read
 * @param {Object} payload
 * @param {string[]} payload.notificationIds - Array of notification IDs
 * @param {boolean} payload.all - Mark all as read
 */
export async function markNotificationsRead({ notificationIds, all } = {}) {
    try {
        const response = await apiClient.post(`${API_BASE}/mark-read`, {
            notificationIds,
            all,
        });
        return response.data;
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
    }
}

/**
 * Create Notification (Admin / System Testing)
 * POST /api/notifications
 */
export async function createNotification(payload) {
    try {
        const response = await apiClient.post(API_BASE, payload);
        return response.data;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

export default {
    getNotifications,
    markNotificationsRead,
    createNotification,
};
