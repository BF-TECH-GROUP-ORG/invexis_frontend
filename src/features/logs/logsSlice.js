import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockLogs } from '@/mocks/logsMockData';

// Helper to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Async thunk to fetch audit logs with filters and pagination using mock data
export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async (params, { rejectWithValue }) => {
        try {
            await delay(400); // Simulate network latency

            let filtered = [...mockLogs];
            const {
                page = 1,
                limit = 20,
                shop,
                worker,
                timeRange,
                search,
                // Advanced Filters
                category,
                action,
                status,
                actor, // simplified text
                target, // simplified text
            } = params;

            // 1. Shop Filter
            if (shop && shop !== 'all') {
                // In a real app, we'd filter by shopId. For mock, we skip or mock it.
                // filtered = filtered.filter(l => l.shopId === shop);
            }

            // 2. Worker Filter
            if (worker && worker !== 'all') {
                if (worker === 'system') {
                    filtered = filtered.filter(l => l.actorType === 'System' || l.user?.name === 'System');
                } else {
                    // Fuzzy match for mock convenience
                    const namePart = worker.replace('_', ' ');
                    filtered = filtered.filter(l => l.user?.name?.toLowerCase().includes(namePart.toLowerCase()));
                }
            }

            // 3. Time Range Filter
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date(); // default to now

            if (timeRange === 'last_month') {
                startDate.setMonth(now.getMonth() - 1);
                startDate.setDate(1);
                endDate.setMonth(now.getMonth());
                endDate.setDate(0); // Last day of prev month
            } else if (timeRange === 'last_3_months') {
                startDate.setMonth(now.getMonth() - 3);
            } else if (timeRange === 'custom') {
                // Custom logic would go here, defaulting to all for mock
                startDate = new Date(0);
            } else {
                // Default: Current Month
                startDate.setDate(1);
            }

            // Apply Date Filter
            filtered = filtered.filter(l => {
                const logTime = new Date(l.timestamp);
                return logTime >= startDate && logTime <= endDate;
            });

            // 4. Advanced Filters (Chips)
            if (category) {
                filtered = filtered.filter(l => l.category?.toLowerCase() === category.toLowerCase());
            }
            if (action) {
                filtered = filtered.filter(l => l.action?.toLowerCase() === action.toLowerCase());
            }
            if (status) {
                filtered = filtered.filter(l => l.status?.toLowerCase() === status.toLowerCase());
            }
            if (actor) {
                filtered = filtered.filter(l =>
                    l.actorType?.toLowerCase().includes(actor.toLowerCase()) ||
                    l.user?.name?.toLowerCase().includes(actor.toLowerCase())
                );
            }
            if (target) {
                filtered = filtered.filter(l => l.target?.toLowerCase().includes(target.toLowerCase()));
            }

            // 5. Smart Search (Global)
            if (search) {
                const lowerQ = search.toLowerCase();
                filtered = filtered.filter(l =>
                    l.description?.toLowerCase().includes(lowerQ) ||
                    l.action?.toLowerCase().includes(lowerQ) ||
                    l.category?.toLowerCase().includes(lowerQ) ||
                    l.user?.name?.toLowerCase().includes(lowerQ) ||
                    l.target?.toLowerCase().includes(lowerQ)
                );
            }

            // Sort by latest first
            filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Pagination
            const total = filtered.length;
            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                data: paginatedData,
                pagination: {
                    total,
                    page,
                    limit
                }
            };
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch logs');
        }
    }
);

// Async thunk to fetch a single log detail
export const fetchLogDetail = createAsyncThunk(
    'logs/fetchLogDetail',
    async (id, { rejectWithValue }) => {
        try {
            await delay(200);
            const log = mockLogs.find((l) => l.id === Number(id));
            if (!log) throw new Error('Log not found');
            return { data: log };
        } catch (err) {
            return rejectWithValue(err.message);
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
