import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API base URL - Replace with your actual API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==================== ASYNC THUNKS ====================

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete product(s)
export const deleteProducts = createAsyncThunk(
  'products/delete',
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: productIds }),
      });
      if (!response.ok) throw new Error('Failed to delete products');
      return productIds;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Upload product image
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ productId, imageFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  products: [
    {
      id: 1,
      name: 'iphone 13',
      category: 'phone',
      unitPrice: 890000,
      inStock: 90,
      discount: 10000,
      status: 'low',
      totalValue: 880000,
      description: 'Latest iPhone model',
      supplier: 'Apple Inc',
      expiryDate: '2025-12-31',
      quantity: 90,
      image: null,
      returnPolicy: {
        dateAdded: '2024-12-12',
        time: '12:00 PM'
      },
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0
    }
  ],
  selectedProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  }
};

// ==================== SLICE ====================

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Select/Deselect products
    toggleSelectProduct: (state, action) => {
      const productId = action.payload;
      const index = state.selectedProducts.indexOf(productId);
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(productId);
      }
    },
    
    // Select all products
    selectAllProducts: (state) => {
      state.selectedProducts = state.products.map(p => p.id);
    },
    
    // Deselect all products
    deselectAllProducts: (state) => {
      state.selectedProducts = [];
    },
    
    // Set current product for editing
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Delete products
    builder
      .addCase(deleteProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => !action.payload.includes(p.id));
        state.selectedProducts = [];
      })
      .addCase(deleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Upload image
    builder
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentProduct) {
          state.currentProduct.image = action.payload.imageUrl;
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// ==================== EXPORTS ====================

export const {
  toggleSelectProduct,
  selectAllProducts,
  deselectAllProducts,
  setCurrentProduct,
  clearCurrentProduct,
  updateFilters,
  clearFilters,
  clearError
} = productSlice.actions;

// Selectors
export const selectAllProductsData = (state) => state.products.products;
export const selectSelectedProducts = (state) => state.products.selectedProducts;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductLoading = (state) => state.products.loading;
export const selectProductError = (state) => state.products.error;
export const selectProductFilters = (state) => state.products.filters;

export default productSlice.reducer;
