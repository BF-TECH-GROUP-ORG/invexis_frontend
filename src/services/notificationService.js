import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/notification";

/**
 * Get User Notifications
 * GET /api/notification
 * @param {Object} params
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {boolean} params.unreadOnly - Filter unread items
 * @param {string} params.role - Filter by user role
 * @param {string} params.companyId - Filter by company context
 * @param {string} params.type - Filter by notification type
 */
export async function getNotifications({ page = 1, limit = 20, unreadOnly, role, companyId, type } = {}, options = {}) {
    try {
        const params = { page, limit };
        if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
        if (role) params.role = role;
        if (companyId) params.companyId = companyId;
        if (type) params.type = type;

        const response = await apiClient.get(API_BASE, {
            params,
            retries: 0,
            timeout: 10000,
            ...options
        });
        return response; // apiClient.get already returns response.data
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

/**
 * Mark Notifications as Read
 * POST /api/notification/mark-read
 */
export async function markNotificationsRead({ notificationIds, all } = {}, options = {}) {
    try {
        const response = await apiClient.post(`${API_BASE}/mark-read`, {
            notificationIds,
            all,
        }, options);
        return response;
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        throw error;
    }
}

/**
 * Create Notification (Admin / System Testing)
 * POST /api/notification
 */
export async function createNotification(payload, options = {}) {
    try {
        const response = await apiClient.post(API_BASE, payload, options);
        return response;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

const notificationService = {
    getNotifications,
    markNotificationsRead,
    createNotification,
};

export default notificationService;
