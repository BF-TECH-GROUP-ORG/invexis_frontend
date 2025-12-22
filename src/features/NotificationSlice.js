
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getNotifications, markNotificationsRead } from "@/services/notificationService";

export const fetchNotificationsThunk = createAsyncThunk(
    "notifications/fetch",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getNotifications(params);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const markAsReadThunk = createAsyncThunk(
    "notifications/markRead",
    async ({ notificationIds, all }, { rejectWithValue }) => {
        try {
            await markNotificationsRead({ notificationIds, all });
            return { notificationIds, all };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const initialState = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    filter: {
        readStatus: 'all', // all, unread, read
        intent: 'all', // all, or specific intent
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
    },
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            // Add new notification to the top
            state.items.unshift(action.payload);
            state.unreadCount += 1;
            // Maintain optimistic total count if we want
            state.pagination.total += 1;
        },
        setFilter: (state, action) => {
            state.filter = { ...state.filter, ...action.payload };
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchNotificationsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
                state.loading = false;

                // API returns: { success: true, data: { notifications: [...], pagination: {...} } }
                if (action.payload?.data?.notifications) {
                    const { notifications, pagination } = action.payload.data;
                    state.items = notifications || [];
                    state.pagination = pagination || state.pagination;

                    // Calculate unread count based on current user if we have it
                    const userId = action.meta.arg?.userId;

                    if (userId) {
                        state.unreadCount = notifications.filter(n => !n.readBy || !n.readBy.includes(userId)).length;
                    } else {
                        // Fallback if userId not provided: count items with 0 readBy
                        state.unreadCount = notifications.filter(n => !n.readBy || n.readBy.length === 0).length;
                    }
                }
            })
            .addCase(fetchNotificationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Mark Read
        builder.addCase(markAsReadThunk.fulfilled, (state, action) => {
            const { notificationIds, all } = action.payload;
            if (all) {
                state.items.forEach(item => {
                    if (!item.readBy) item.readBy = ['system'];
                    else if (item.readBy.length === 0) item.readBy.push('system');
                });
                state.unreadCount = 0;
            } else if (notificationIds && notificationIds.length > 0) {
                notificationIds.forEach(id => {
                    const item = state.items.find(n => n._id === id);
                    if (item && (!item.readBy || item.readBy.length === 0)) {
                        item.readBy = ['system'];
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                });
            }
        });
    },
});

export const { addNotification, setFilter, resetState } = notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.loading;
export const selectNotificationFilter = (state) => state.notifications.filter;

// Client-side filtering selector (if needed, though we prefer backend filtering)
export const selectFilteredNotifications = (state) => {
    const { items, filter } = state.notifications;
    const { readStatus, intent } = filter;

    // Note: mostly we rely on backend, but for "Real-time" updates we might need to filter what we show
    return items.filter(item => {
        // Filter by Intent
        if (intent !== 'all' && item.type !== intent) return false; // assuming type maps to intent or we need a mapper
        // Filter by Read Status (tricky without User ID in slice)
        // We'll assume the list in state *is* what needs to be shown (fetched with filters).
        return true;
    });
};

export default notificationSlice.reducer;
