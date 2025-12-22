import apiClient from '@/lib/apiClient';

// Utility: derive API base similar to other services
const getApiBase = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_SW || 'http://localhost:5000';
    if (url.startsWith('wss://')) return url.replace('wss://', 'https://');
    if (url.startsWith('ws://')) return url.replace('ws://', 'http://');
    return url;
};

const BASE_API = getApiBase().replace(/\/$/, '');

/**
 * LogsService
 *
 * Read-only access to audit/log entries.
 * All network requests MUST use the shared `apiClient` abstraction.
 */
const LogsService = {
    /**
     * Retrieve audit/log entries from the backend.
     *
     * Supported filters:
     * - companyId / shopId: filter by shop/company
     * - workerId: id of the user who performed the action
     * - from / startDate: ISO string or YYYY-MM-DD
     * - to / endDate: ISO string or YYYY-MM-DD
     * - q: free-text search
     * - page: page number (1-based)
     * - limit: page size
     *
     * The function builds query parameters dynamically and returns the raw
     * backend response (no transformation) so the UI can consume server data.
     *
     * @param {object} filters
     * @returns {Promise<import('axios').AxiosResponse>} axios response
     */
    getLogs: async (filters = {}) => {
        const params = {};

        // Enforce API contract parameter names exactly:
        // source, type, entityId, entityType, userId, companyId, startDate, endDate, page, limit

        if (filters.source) params.source = String(filters.source);
        if (filters.type) params.type = String(filters.type);
        if (filters.entityId) params.entityId = String(filters.entityId);
        if (filters.entityType) params.entityType = String(filters.entityType);

        // shopId (UI) -> companyId (API)
        if (filters.companyId) params.companyId = String(filters.companyId);
        else if (filters.shopId) params.companyId = String(filters.shopId);

        // workerId (UI) -> userId (API)
        if (filters.workerId) params.userId = String(filters.workerId);
        else if (filters.userId) params.userId = String(filters.userId || '');

        // Date range: default to current month when not provided
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const defaultFrom = new Date(year, month, 1, 0, 0, 0, 0).toISOString();
        const lastDay = new Date(year, month + 1, 0);
        const defaultTo = new Date(year, month, lastDay.getDate(), 23, 59, 59, 999).toISOString();

        params.startDate = filters.startDate || filters.from || filters.start || defaultFrom;
        params.endDate = filters.endDate || filters.to || filters.end || defaultTo;

        // Pagination: enforce safe defaults (page=1, limit=20)
        params.page = Number.isFinite(Number(filters.page)) && Number(filters.page) > 0 ? Number(filters.page) : 1;
        params.limit = Number.isFinite(Number(filters.limit)) && Number(filters.limit) > 0 ? Number(filters.limit) : 20;

        // Free-text search and a few pass-through/UI-friendly filters
        if (filters.q) params.q = String(filters.q);
        if (filters.category) params.category = String(filters.category);
        if (filters.action) params.action = String(filters.action);
        if (filters.status) params.status = String(filters.status);

        const url = `${BASE_API}/audit/logs`;

        // Diagnostic logging to help track gateway routing issues in dev
        if (process.env.NODE_ENV === 'development') {
            try {
                console.info('[LogsService] GET', url, 'params ->', params);
            } catch (e) { /* no-op */ }
        }

        // Use apiClient for request (no fetch/raw calls). Let apiClient handle retries/interceptors.
        try {
            const response = await apiClient.get(url, { params, retries: 0 });
            return response;
        } catch (err) {
            // Surface helpful diagnostics in development
            if (process.env.NODE_ENV === 'development') {
                console.error('[LogsService] GET failed:', url, params, err);
            }
            throw err;
        }
    },

    /**
     * Retrieve a single audit log entry by id.
     * Returns the raw axios response (API contract may return 404/403 which callers should handle).
     */
    getLog: async (id) => {
        if (!id) throw new Error('getLog requires an id');
        const url = `${BASE_API}/audit/logs/${encodeURIComponent(String(id))}`;
        if (process.env.NODE_ENV === 'development') {
            try { console.info('[LogsService] GET', url); } catch (e) {}
        }

        try {
            const response = await apiClient.get(url, { retries: 0 });
            return response;
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[LogsService] GET /audit/logs/:id failed', id, err);
            }
            throw err;
        }
    }
,

    /**
     * Retrieve workers analytics used to populate worker filter dropdown.
     * Endpoint: GET /audit/analytics/workers?companyId={id}&shopId={shopId}
     * Returns raw backend response.
     */
    getWorkersAnalytics: async (filters = {}) => {
        const params = {};
        if (filters.companyId) params.companyId = String(filters.companyId);
        if (filters.shopId) params.shopId = String(filters.shopId);

        const url = `${BASE_API}/audit/analytics/workers`;

        if (process.env.NODE_ENV === 'development') {
            try { console.info('[LogsService] GET', url, 'params ->', params); } catch (e) {}
        }

        try {
            const response = await apiClient.get(url, { params, retries: 0 });
            return response;
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[LogsService] GET /audit/analytics/workers failed', params, err);
            }
            throw err;
        }
    }
    ,

    /**
     * Fetch workers/staff list from the auth service for a company.
     * Endpoint: GET /auth/company/:companyId/workers
     * Returns raw backend response.
     */
    getWorkersByCompanyId: async (companyId) => {
        if (!companyId) throw new Error('companyId is required');
        const url = `${BASE_API}/auth/company/${encodeURIComponent(String(companyId))}/workers`;
        if (process.env.NODE_ENV === 'development') {
            try { console.info('[LogsService] GET', url); } catch (e) {}
        }

        try {
            const response = await apiClient.get(url, { retries: 0 });
            return response;
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[LogsService] GET /auth/company/:companyId/workers failed', companyId, err);
            }
            throw err;
        }
    }
};

export default LogsService;
