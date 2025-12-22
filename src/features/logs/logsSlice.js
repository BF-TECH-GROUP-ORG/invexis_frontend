import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LogsService from '@/services/logsService';

// Async thunk to fetch audit logs using the service layer (no mocks here)
export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async (params = {}, { rejectWithValue }) => {
        try {
            // Map UI-level filters to service parameters. Keep mapping minimal so UI can continue to use the same keys.
            const {
                page = 1,
                limit = 20,
                shop, // -> companyId
                worker, // -> workerId (or userId)
                timeRange,
                search,
                startDate: customStart,
                endDate: customEnd,
                // pass-through any server-supported filters
                category,
                action,
                status,
                source,
                type,
                entityId,
                entityType,
            } = params || {};

            const filters = {};

            // Pagination
            filters.page = page;
            filters.limit = limit;

            // Company / shop
            if (shop && shop !== 'all') filters.companyId = shop;

            // Worker -> userId
            if (worker && worker !== 'all') {
                // Keep a special-case for `system` if the UI uses it
                if (worker === 'system') filters.userId = 'system';
                else filters.userId = worker;
            }

            // Time range -> startDate/endDate; allow custom overrides
            if (timeRange === 'custom' && (customStart || customEnd)) {
                if (customStart) filters.startDate = customStart;
                if (customEnd) filters.endDate = customEnd;
            } else if (timeRange === 'last_month') {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).toISOString();
                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
                const end = new Date(now.getFullYear(), now.getMonth() - 1, lastDay, 23, 59, 59, 999).toISOString();
                filters.startDate = start;
                filters.endDate = end;
            } else if (timeRange === 'last_3_months') {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0).toISOString();
                filters.startDate = start;
            } else {
                // default behaviour: leave dates undefined so service applies current-month defaults
            }

            // Search -> free-text param (map to `q` if backend supports it)
            if (search) filters.q = search;

            // Pass through server-side filters if present
            if (source) filters.source = source;
            if (type) filters.type = type;
            if (entityId) filters.entityId = entityId;
            if (entityType) filters.entityType = entityType;
            if (category) filters.category = category;
            if (action) filters.action = action;
            if (status) filters.status = status;

            // Call service (service returns backend payload). Let errors propagate to be handled by extraReducers.
            const resp = await LogsService.getLogs(filters);

            // LogsService.getLogs returns the backend payload (or throws).
            // Normalize response shapes: backend might return { success, data, pagination } or { data, pagination }
            const body = resp?.data ?? resp; // if service returned raw axios response, prefer .data; if already data, use it

            // Backend contract: { success: true, data: [...], pagination: { total, page, pages } }
            // Normalize to { data: [], pagination: { total, page, limit } }
            const data = body?.data ?? [];
            const pagination = body?.pagination ?? {
                total: Array.isArray(data) ? data.length : 0,
                page: Number(filters.page) || 1,
                limit: Number(filters.limit) || 20,
            };

            return { data, pagination };
        } catch (err) {
            return rejectWithValue(err?.message || err || 'Failed to fetch logs');
        }
    }
);

// Async thunk to fetch a single log detail
export const fetchLogDetail = createAsyncThunk(
    'logs/fetchLogDetail',
    async (id, { rejectWithValue }) => {
        try {
            if (!id) throw new Error('Log id is required');
            const resp = await LogsService.getLog(id);
            const body = resp?.data ?? resp;
            return { data: body?.data ?? body };
        } catch (err) {
            return rejectWithValue(err?.message || 'Failed to fetch log detail');
        }
    }
);

const logsSlice = createSlice({
    name: 'logs',
    initialState: {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        filters: {
            shop: 'all',
            worker: 'all',
            timeRange: 'current_month',
            search: ''
        },
        loading: false,
        error: null,
        selectedLog: null,
        selectedLogDetail: null,
        detailLoading: false,
        detailError: null,
    },
    reducers: {
        setFilters(state, action) {
            // Replace filters entirely or update partial
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
        },
        removeFilter(state, action) {
            const newFilters = { ...state.filters };
            delete newFilters[action.payload];
            state.filters = newFilters;
            state.page = 1;
        },
        clearFilters(state) {
            state.filters = {
                shop: 'all',
                worker: 'all',
                timeRange: 'current_month',
                search: ''
            };
            state.page = 1;
        },
        setPage(state, action) {
            state.page = action.payload;
        },
        setLimit(state, action) {
            state.limit = action.payload;
        },
        openLogDetail(state, action) {
            state.selectedLog = action.payload; // id
        },
        closeLogDetail(state) {
            state.selectedLog = null;
            state.selectedLogDetail = null;
            state.detailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.loading = false;
                const { data, pagination } = action.payload;
                state.items = data;
                state.total = pagination.total;
                state.page = pagination.page;
                state.limit = pagination.limit;
            })
            .addCase(fetchLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchLogDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchLogDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedLogDetail = action.payload.data;
            })
            .addCase(fetchLogDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            });
    },
});

export const {
    setFilters,
    setPage,
    setLimit,
    openLogDetail,
    closeLogDetail
} = logsSlice.actions;

export default logsSlice.reducer;
