/**
 * Transform backend audit log data to frontend table format
 * 
 * Backend format:
 * {
 *   _id, event_type, source_service, companyId, userId, entityId, entityType,
 *   payload, metadata, occurred_at, severity, tags, changes
 * }
 * 
 * Frontend format:
 * {
 *   id, timestamp, category, action, description, user: { name }, status, actorType
 * }
 */

/**
 * Extract category from event_type
 * @param {string} eventType - e.g., "notification.created", "sale.created"
 * @returns {string} - e.g., "Notification", "Sales"
 */
const extractCategory = (eventType) => {
    if (!eventType) return 'System';

    const categoryMap = {
        'notification': 'User & Access',
        'sale': 'Sales',
        'invoice': 'Sales',
        'shop': 'Inventory',
        'inventory': 'Inventory',
        'payment': 'Payments',
        'user': 'User & Access',
        'auth': 'User & Access',
    };

    const prefix = eventType.split('.')[0];
    return categoryMap[prefix] || 'System';
};

/**
 * Extract action from event_type
 * @param {string} eventType - e.g., "notification.created", "inventory.stock.updated"
 * @returns {string} - e.g., "Created", "Updated"
 */
const extractAction = (eventType) => {
    if (!eventType) return 'Unknown';

    const parts = eventType.split('.');
    const action = parts[parts.length - 1];

    // Capitalize first letter
    return action.charAt(0).toUpperCase() + action.slice(1);
};

/**
 * Generate description from payload based on event type
 * @param {string} eventType
 * @param {object} payload
 * @param {string} entityType
 * @returns {string}
 */
const generateDescription = (eventType, payload, entityType) => {
    if (!eventType || !payload) return 'System activity';

    try {
        const type = eventType.toLowerCase();

        // Notification events
        if (type.includes('notification')) {
            const title = payload.title || payload.content?.title || 'Notification';
            const priority = payload.priority || 'normal';
            return `${title} (Priority: ${priority})`;
        }

        // Sale events
        if (type.includes('sale.created')) {
            const amount = payload.totalAmount || 0;
            const method = payload.paymentMethod || 'unknown';
            const itemCount = payload.items?.length || 0;
            return `Sale created: ${itemCount} item(s), Total: ${amount} via ${method}`;
        }

        // Invoice events
        if (type.includes('invoice.created')) {
            const invoiceNum = payload.invoiceNumber || payload.invoiceId || 'N/A';
            const amount = payload.totalAmount || 0;
            const status = payload.status || 'ISSUED';
            return `Invoice ${invoiceNum} created: ${amount} (${status})`;
        }

        // Shop events
        if (type.includes('shop.created')) {
            const name = payload.name || 'Unknown Shop';
            const location = payload.location?.city || payload.location?.address || 'Unknown location';
            return `Shop "${name}" created at ${location}`;
        }

        // Inventory product events
        if (type.includes('inventory.product')) {
            const productName = payload.name || 'Unknown Product';
            const action = extractAction(eventType);
            return `Product "${productName}" ${action.toLowerCase()}`;
        }

        // Inventory stock events
        if (type.includes('inventory.stock')) {
            const oldQty = payload.oldQuantity || 0;
            const newQty = payload.newQuantity || 0;
            const diff = newQty - oldQty;
            const change = diff > 0 ? `+${diff}` : diff;
            return `Stock updated: ${oldQty} → ${newQty} (${change})`;
        }

        // Default fallback
        return `${extractAction(eventType)} ${entityType || 'entity'}`;
    } catch (error) {
        return 'System activity';
    }
};

/**
 * Map severity to status
 * @param {string} severity - "low", "medium", "high", "critical"
 * @returns {string} - "SUCCESS", "WARNING", "FAILURE"
 */
const mapSeverityToStatus = (severity) => {
    const severityMap = {
        'low': 'SUCCESS',
        'medium': 'SUCCESS',
        'high': 'WARNING',
        'critical': 'FAILURE',
    };

    return severityMap[severity?.toLowerCase()] || 'SUCCESS';
};

/**
 * Get user name from userId or payload
 * @param {string} userId
 * @param {object} payload
 * @returns {object} - { name: string }
 */
const getUserInfo = (userId, payload) => {
    // Try to extract user name from payload
    if (payload?.userName || payload?.user?.name) {
        return { name: payload.userName || payload.user.name };
    }

    // If userId is 'system' or not provided
    if (!userId || userId === 'system') {
        return { name: 'System' };
    }

    // Return userId as fallback
    return { name: userId.substring(0, 8) + '...' };
};

/**
 * Transform a single log entry
 * @param {object} log - Backend log entry
 * @returns {object} - Frontend log entry
 */
const transformLog = (log) => {
    if (!log) return null;

    return {
        id: log._id || log.id,
        timestamp: log.occurred_at || log.createdAt || new Date().toISOString(),
        category: extractCategory(log.event_type),
        action: extractAction(log.event_type),
        description: generateDescription(log.event_type, log.payload, log.entityType),
        user: getUserInfo(log.userId, log.payload),
        status: mapSeverityToStatus(log.severity),
        actorType: log.source_service || 'system',

        // Keep original data for detail view
        _original: log,
    };
};

/**
 * Transform array of logs
 * @param {Array} logs - Array of backend log entries
 * @returns {Array} - Array of frontend log entries
 */
export const transformLogs = (logs) => {
    if (!Array.isArray(logs)) return [];

    return logs
        .map(transformLog)
        .filter(log => log !== null);
};

export default transformLogs;
