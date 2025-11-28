import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoriesService from '@/services/categoriesService';

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await categoriesService.createCategory(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const data = await categoriesService.updateCategory(id, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      const data = await categoriesService.deleteCategory(id);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleCategoryActive = createAsyncThunk(
  'categories/toggleActive',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const current = state.categories.items.find((c) => c._id === id);
      const newVal = current ? !current.isActive : true;
      const data = await categoriesService.updateCategory(id, { isActive: newVal });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'categories/',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await categoriesService.getCategories(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null, // Track when data was last fetched
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data || action.payload || [];
        state.lastFetched = Date.now(); // Set timestamp when data is fetched
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload?.data || action.payload;
        if (newItem) state.items = [newItem, ...state.items];
      })
      .addCase(createCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Update
    builder
      .addCase(updateCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        if (updated) {
          state.items = state.items.map((it) => (it._id === updated._id ? { ...it, ...updated } : it));
        }
      })
      .addCase(updateCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Delete
    builder
      .addCase(deleteCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id || action.payload?.data?._id || action.payload?.data?.id;
        if (id) state.items = state.items.filter((it) => it._id !== id && it._id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Toggle active
    builder
      .addCase(toggleCategoryActive.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(toggleCategoryActive.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        if (updated && updated._id) {
          state.items = state.items.map((it) => (it._id === updated._id ? { ...it, ...updated } : it));
        }
      })
      .addCase(toggleCategoryActive.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError, clearCache } = categoriesSlice.actions;
export default categoriesSlice.reducer;
