import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Use the same API base as products/categories for consistency
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://granitic-jule-haunting.ngrok-free.dev/api/inventory/v1';

export const fetchWarehouses = createAsyncThunk(
  'warehouses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/warehouses`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'warehouses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/warehouses/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouses/create',
  async (warehouseData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/warehouses`, warehouseData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouses/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/warehouses/${id}`, updates);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState: {
    items: [],
    selectedWarehouse: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.selectedWarehouse = action.payload.data;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data);
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.items.findIndex(w => w._id === action.payload.data._id);
        if (index !== -1) state.items[index] = action.payload.data;
      });
  },
});

export const { setSelectedWarehouse, clearError } = warehousesSlice.actions;
export default warehousesSlice.reducer;