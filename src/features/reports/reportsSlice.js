import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchInventorySummary = createAsyncThunk(
  'reports/inventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/inventory-summary`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDailyReport = createAsyncThunk(
  'reports/dailyReport',
  async (date, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/daily?date=${date}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductReport = createAsyncThunk(
  'reports/productReport',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/product/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchABCAnalysis = createAsyncThunk(
  'reports/abcAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/abc-analysis`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAgingInventory = createAsyncThunk(
  'reports/agingInventory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/reports/aging-inventory`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStockMovement = createAsyncThunk(
  'reports/stockMovement',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE}/reports/stock-movement?startDate=${startDate}&endDate=${endDate}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    inventorySummary: null,
    dailyReport: null,
    productReport: null,
    abcAnalysis: null,
    agingInventory: null,
    stockMovement: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.inventorySummary = null;
      state.dailyReport = null;
      state.productReport = null;
      state.abcAnalysis = null;
      state.agingInventory = null;
      state.stockMovement = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventorySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.inventorySummary = action.payload.data;
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDailyReport.fulfilled, (state, action) => {
        state.dailyReport = action.payload.data;
      })
      .addCase(fetchProductReport.fulfilled, (state, action) => {
        state.productReport = action.payload.data;
      })
      .addCase(fetchABCAnalysis.fulfilled, (state, action) => {
        state.abcAnalysis = action.payload.data;
      })
      .addCase(fetchAgingInventory.fulfilled, (state, action) => {
        state.agingInventory = action.payload.data;
      })
      .addCase(fetchStockMovement.fulfilled, (state, action) => {
        state.stockMovement = action.payload.data;
      });
  },
});

export const { clearReports, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;