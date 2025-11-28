import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/alerts`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAlert = createAsyncThunk(
  'alerts/create',
  async (alertData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/alerts`, alertData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${API_BASE}/alerts/${id}/resolve`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/alerts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.unreadCount = action.payload.data.filter(a => !a.isResolved).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data);
        state.unreadCount += 1;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.items[index] = action.payload.data;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        const alert = state.items.find(a => a._id === action.payload);
        if (alert && !alert.isResolved) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter(a => a._id !== action.payload);
      });
  },
});

export const { clearError } = alertsSlice.actions;
export default alertsSlice.reducer;