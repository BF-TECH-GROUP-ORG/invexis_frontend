import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuditLogs } from '@/services/auditService';

export const fetchLogs = createAsyncThunk(
    'logs/fetchLogs',
    async ({ page, limit, ...filters }, { getState, rejectWithValue }) => {
        try {
            const companyId = filters.companyId;

            // Map UI filter keys to backend expected keys
            const params = {
                page,
                limit,
                shopId: filters.shop !== 'all' ? filters.shop : undefined,
                userId: filters.worker !== 'all' ? filters.worker : undefined,
                event_type: filters.action || filters.category || undefined,
                severity: filters.status?.toLowerCase() || undefined,
                search: filters.search || undefined,
            };

            // Remove undefined params
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
            const response = await getAuditLogs(companyId, params);
            console.log('Audit logs raw response:', response);

            // Handle both wrapped response and direct array
            const logs = response.data || (Array.isArray(response) ? response : []);
            const total = response.pagination?.total || (response.total) || logs.length;

            console.log('Extracted logs array:', logs);
            console.log('Total count:', total);

            // Transform data to match UI expectations
            const items = logs.map(log => {
                // Better description logic based on event type
                let description = log.description || log.event_type;
                if (log.event_type === 'inventory.stock.updated') {
                    description = `Stock updated for product ${log.payload?.productId || ''}: ${log.payload?.oldQuantity} → ${log.payload?.newQuantity}`;
                } else if (log.event_type === 'sale.created') {
                    description = `New sale #${log.payload?.saleId} created by ${log.payload?.soldBy || 'unknown'}`;
                } else if (log.event_type === 'invoice.created') {
                    description = `Invoice #${log.payload?.invoiceNumber} issued for sale #${log.payload?.saleId}`;
                } else if (log.event_type === 'inventory.product.updated') {
                    description = `Product details updated: ${log.payload?.name || log.payload?.sku || log.entityId}`;
                }

                // Better actor logic
                const actorId = log.userId || log.payload?.soldBy || log.payload?.userId || 'System';

                // Better before/after logic for state changes
                let before = log.payload?.before || log.metadata?.before;
                let after = log.payload?.after || log.metadata?.after;

                // Special handling for stock updates
                if (log.event_type === 'inventory.stock.updated') {
                    before = { quantity: log.payload?.oldQuantity };
                    after = { quantity: log.payload?.newQuantity };
                }

                return {
                    id: log._id,
                    timestamp: log.occurred_at,
                    category: log.source_service,
                    action: log.event_type,
                    description,
                    actorType: log.entityType,
                    status: log.severity === 'high' ? 'FAILURE' : log.severity === 'medium' ? 'WARNING' : 'SUCCESS',
                    user: { name: actorId },
                    payload: log.payload,
                    metadata: log.metadata,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    source: log.source_service,
                    before,
                    after,
                    target: log.payload?.productName || log.payload?.name || log.payload?.invoiceNumber || log.payload?.saleId || log.entityId || log.entityType,
                };
            });

            return {
                items,
                total,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchLogDetail = createAsyncThunk(
    'logs/fetchLogDetail',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { logs } = getState();
            const log = logs.items.find(item => item.id === id);
            if (log) return log;

            // If not in list, fetch single (though our service currently returns list)
            // For now just return from list or error
            return rejectWithValue("Log not found in current list");
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const logsSlice = createSlice({
    name: 'logs',
    initialState: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
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
        detailError: null
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = action.payload;
            state.page = 1;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setLimit: (state, action) => {
            state.limit = action.payload;
            state.page = 1;
        },
        openLogDetail: (state, action) => {
            state.selectedLog = action.payload;
        },
        closeLogDetail: (state) => {
            state.selectedLog = null;
            state.selectedLogDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
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
                state.selectedLogDetail = action.payload;
            })
            .addCase(fetchLogDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            });
    }
});

export const { setFilters, setPage, setLimit, openLogDetail, closeLogDetail } = logsSlice.actions;
export default logsSlice.reducer;
