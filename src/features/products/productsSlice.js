import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as productsService from "@/services/productsService";

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (
    { page = 1, limit = 20, category, search, companyId } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await productsService.getProducts({
        page,
        limit,
        category,
        search,
        companyId,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const data = await productsService.getFeaturedProducts();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await productsService.getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      // Support FormData uploads (when productData is a FormData including files)
      if (typeof FormData !== "undefined" && productData instanceof FormData) {
        const data = await productsService.createProduct(productData);
        return data;
      }

      const slugify = (s = "") =>
        s
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "");

      const payload = { ...productData };
      if (!payload.slug && payload.name) payload.slug = slugify(payload.name);

      const data = await productsService.createProduct(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const data = await productsService.updateProduct(id, updates);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await productsService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStock = createAsyncThunk(
  "products/updateStock",
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const data = await productsService.updateStock(id, stockData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/search",
  async (query, { rejectWithValue }) => {
    try {
      const data = await productsService.searchProducts(query);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    featured: [],
    selectedProduct: null,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    loading: false,
    error: null,
    searchResults: [],
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data || action.payload || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload?.data || action.payload || [];
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload?.data || action.payload || null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        const newItem = action.payload?.data || action.payload;
        if (newItem) state.items.unshift(newItem);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const payloadData = action.payload?.data || action.payload;
        const index = state.items.findIndex((p) => p._id === payloadData?._id);
        if (index !== -1 && payloadData) state.items[index] = payloadData;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const payloadData = action.payload?.data || action.payload;
        const index = state.items.findIndex((p) => p._id === payloadData?._id);
        if (index !== -1 && payloadData) state.items[index] = payloadData;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload?.data || action.payload || [];
      });
  },
});

export const { setSelectedProduct, clearSearchResults, clearError } =
  productsSlice.actions;
export default productsSlice.reducer;
