import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import announcementService from '@/services/announcementService';

// Async Thunks
export const fetchAnnouncements = createAsyncThunk(
    'announcements/fetchAnnouncements',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await announcementService.getAnnouncements(filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markAnnouncementRead = createAsyncThunk(
    'announcements/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await announcementService.markAsRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAnnouncement = createAsyncThunk(
    'announcements/delete',
    async (id, { rejectWithValue }) => {
        try {
            await announcementService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const snoozeAnnouncement = createAsyncThunk(
    'announcements/snooze',
    async ({ id, duration }, { rejectWithValue }) => {
        try {
            await announcementService.snooze(id, duration);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const announcementsSlice = createSlice({
    name: 'announcements',
    initialState: {
        items: [],
        unreadCount: 0,
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        // Socket Actions
        addAnnouncement: (state, action) => {
            state.items.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        updateAnnouncement: (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                const wasRead = state.items[index].isRead;
                const isRead = action.payload.isRead;

                state.items[index] = action.payload;

                // Update count if read status changed
                if (!wasRead && isRead) state.unreadCount -= 1;
                if (wasRead && !isRead) state.unreadCount += 1;
            }
        },
        removeAnnouncement: (state, action) => {
            const index = state.items.findIndex(item => item.id === action.payload);
            if (index !== -1) {
                if (!state.items[index].isRead) {
                    state.unreadCount -= 1;
                }
                state.items.splice(index, 1);
            }
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchAnnouncements.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAnnouncements.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.unreadCount = action.payload.filter(a => !a.isRead).length;
            })
            .addCase(fetchAnnouncements.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Mark Read
            .addCase(markAnnouncementRead.fulfilled, (state, action) => {
                const item = state.items.find(i => i.id === action.payload);
                if (item && !item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Delete
            .addCase(deleteAnnouncement.fulfilled, (state, action) => {
                const index = state.items.findIndex(i => i.id === action.payload);
                if (index !== -1) {
                    if (!state.items[index].isRead) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.items.splice(index, 1);
                }
            })
            // Snooze (removes from list for now)
            .addCase(snoozeAnnouncement.fulfilled, (state, action) => {
                const index = state.items.findIndex(i => i.id === action.payload);
                if (index !== -1) {
                    if (!state.items[index].isRead) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.items.splice(index, 1);
                }
            });
    },
});

export const { addAnnouncement, updateAnnouncement, removeAnnouncement, setUnreadCount } = announcementsSlice.actions;

export const initializeLiveUpdates = createAsyncThunk(
    'announcements/initializeLiveUpdates',
    async (_, { dispatch }) => {
        announcementService.connect();
        announcementService.on('new', (announcement) => {
            dispatch(addAnnouncement(announcement));
        });
        announcementService.on('update', (announcement) => {
            dispatch(updateAnnouncement(announcement));
        });
        announcementService.on('delete', (id) => {
            dispatch(removeAnnouncement(id));
        });
    }
);

// Selectors
export const selectAllAnnouncements = (state) => state.announcements.items;
export const selectUnreadCount = (state) => state.announcements.unreadCount;
export const selectAnnouncementsStatus = (state) => state.announcements.status;

export default announcementsSlice.reducer;
