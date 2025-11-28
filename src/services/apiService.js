// src/services/apiService.js
// This wraps mock data to match your existing Redux axios responses

import axios from 'axios';

// ✅ Toggle between mock and real API
// For production / real-backend integration set to false so axios uses real endpoints
const USE_MOCK_API = false; // set to false to use actual backend APIs

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================
// MOCK DATA
// ============================================

const mockCategories = [
  { _id: "cat_001", name: "Electronics", level: 1, description: "Electronic devices" },
  { _id: "cat_002", name: "Smartphones", level: 2, parentId: "cat_001" },
  { _id: "cat_003", name: "Laptops", level: 2, parentId: "cat_001" },
  { _id: "cat_004", name: "Clothing", level: 1, description: "Apparel" },
  { _id: "cat_005", name: "Men's Wear", level: 2, parentId: "cat_004" },
  { _id: "cat_006", name: "Women's Wear", level: 2, parentId: "cat_004" },
  { _id: "cat_007", name: "Home & Garden", level: 1 },
  { _id: "cat_008", name: "Furniture", level: 2, parentId: "cat_007" },
  { _id: "cat_009", name: "Sports", level: 1 },
  { _id: "cat_010", name: "Books", level: 1 },
];

const mockWarehouses = [
  {
    _id: "wh_001",
    name: "Main Warehouse",
    location: { city: "New York", state: "NY", country: "USA", address: "123 Main St" },
    capacity: 10000,
    currentStock: 7500
  },
  {
    _id: "wh_002",
    name: "West Coast Distribution",
    location: { city: "Los Angeles", state: "CA", country: "USA", address: "456 West Ave" },
    capacity: 15000,
    currentStock: 12000
  },
  {
    _id: "wh_003",
    name: "East Coast Hub",
    location: { city: "Boston", state: "MA", country: "USA", address: "789 East Blvd" },
    capacity: 8000,
    currentStock: 5000
  },
  {
    _id: "wh_004",
    name: "Midwest Storage",
    location: { city: "Chicago", state: "IL", country: "USA", address: "321 Central Rd" },
    capacity: 12000,
    currentStock: 9000
  },
];

let mockProducts = [
  {
    _id: "prod_001",
    name: "iPhone 15 Pro",
    sku: "APL-IP15P-256-BLK",
    category: "cat_002",
    price: 999.99,
    costPrice: 750.00,
    stock: 150,
    minStockLevel: 20,
    maxStockLevel: 500,
    warehouse: "wh_001",
    status: "active",
    visibility: "public",
    description: "Latest iPhone with A17 Pro chip",
    specifications: { brand: "Apple", model: "15 Pro", color: "Black", warranty: "1 year" },
    images: [],
    tags: ["smartphone", "apple", "5g"],
    isTaxable: true,
    trackInventory: true,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "prod_002",
    name: "Samsung Galaxy S24",
    sku: "SAM-GS24-128-WHT",
    category: "cat_002",
    price: 849.99,
    costPrice: 650.00,
    stock: 200,
    minStockLevel: 25,
    warehouse: "wh_001",
    status: "active",
    visibility: "public",
    description: "Flagship Samsung phone",
    specifications: { brand: "Samsung", model: "S24", color: "White", warranty: "1 year" },
    images: [],
    tags: ["smartphone", "samsung", "android"],
    isTaxable: true,
    trackInventory: true,
    createdAt: "2024-01-20T14:20:00Z"
  },
  {
    _id: "prod_003",
    name: "MacBook Pro 16\"",
    sku: "APL-MBP16-512-SLV",
    category: "cat_003",
    price: 2499.99,
    costPrice: 2000.00,
    stock: 75,
    minStockLevel: 10,
    warehouse: "wh_002",
    status: "active",
    visibility: "featured",
    description: "Powerful laptop for professionals",
    specifications: { brand: "Apple", model: "MacBook Pro 16", color: "Silver", warranty: "1 year" },
    images: [],
    tags: ["laptop", "apple", "macbook"],
    isTaxable: true,
    trackInventory: true,
    createdAt: "2024-02-01T09:15:00Z"
  },
];

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK API (Matches your Axios response format)
// ============================================

const mockAPI = {
  products: {
    async getAll(params = {}) {
      await delay();
      const { page = 1, limit = 20, category, search } = params;
      
      let filtered = [...mockProducts];
      
      // Filter by category
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = filtered.slice(start, end);
      
      return {
        data: {
          data: paginatedData,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filtered.length,
            pages: Math.ceil(filtered.length / limit)
          }
        }
      };
    },

    async getFeatured() {
      await delay();
      const featured = mockProducts.filter(p => p.visibility === 'featured');
      return { data: { data: featured } };
    },

    async getById(id) {
      await delay();
      const product = mockProducts.find(p => p._id === id);
      if (!product) throw new Error('Product not found');
      return { data: { data: product } };
    },

    async create(productData) {
      await delay();
      const newProduct = {
        _id: `prod_${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProducts.unshift(newProduct);
      return { data: { data: newProduct, message: 'Product created successfully' } };
    },

    async update(id, updates) {
      await delay();
      const index = mockProducts.findIndex(p => p._id === id);
      if (index === -1) throw new Error('Product not found');
      
      mockProducts[index] = {
        ...mockProducts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return { data: { data: mockProducts[index], message: 'Product updated successfully' } };
    },

    async delete(id) {
      await delay();
      const index = mockProducts.findIndex(p => p._id === id);
      if (index === -1) throw new Error('Product not found');
      
      mockProducts = mockProducts.filter(p => p._id !== id);
      return { data: { message: 'Product deleted successfully' } };
    },

    async updateStock(id, stockData) {
      await delay();
      const index = mockProducts.findIndex(p => p._id === id);
      if (index === -1) throw new Error('Product not found');
      
      mockProducts[index] = {
        ...mockProducts[index],
        stock: stockData.stock || mockProducts[index].stock,
        updatedAt: new Date().toISOString()
      };
      return { data: { data: mockProducts[index] } };
    },

    async search(query) {
      await delay();
      const searchLower = query.toLowerCase();
      const results = mockProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
      return { data: { data: results } };
    }
  },

  categories: {
    async getAll() {
      await delay();
      return { data: { data: mockCategories } };
    }
  },

  warehouses: {
    async getAll() {
      await delay();
      return { data: { data: mockWarehouses } };
    }
  }
};

// ============================================
// AXIOS INTERCEPTOR (Intercepts real API calls)
// ============================================

if (USE_MOCK_API) {
  // Intercept all axios requests
  axios.interceptors.request.use(
    async (config) => {
      // Only intercept requests to your API_BASE
      if (config.url?.startsWith(API_BASE)) {
        console.log('🔶 Intercepting API call with mock data:', config.url);
        
        const url = config.url.replace(API_BASE, '');
        const method = config.method?.toLowerCase();
        
        // Products endpoints
        if (url.includes('/products/featured')) {
          const response = await mockAPI.products.getFeatured();
          return Promise.reject({ response, isIntercepted: true });
        }
        
        if (url.match(/\/products\/[^/]+$/)) {
          const id = url.split('/').pop();
          if (method === 'get') {
            const response = await mockAPI.products.getById(id);
            return Promise.reject({ response, isIntercepted: true });
          }
          if (method === 'put') {
            const response = await mockAPI.products.update(id, config.data);
            return Promise.reject({ response, isIntercepted: true });
          }
          if (method === 'delete') {
            const response = await mockAPI.products.delete(id);
            return Promise.reject({ response, isIntercepted: true });
          }
        }
        
        if (url.includes('/products/search')) {
          const query = new URLSearchParams(url.split('?')[1]).get('q');
          const response = await mockAPI.products.search(query);
          return Promise.reject({ response, isIntercepted: true });
        }
        
        if (url.includes('/products') && method === 'get') {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          const params = {
            page: urlParams.get('page'),
            limit: urlParams.get('limit'),
            category: urlParams.get('category'),
            search: urlParams.get('search')
          };
          const response = await mockAPI.products.getAll(params);
          return Promise.reject({ response, isIntercepted: true });
        }
        
        if (url.includes('/products') && method === 'post') {
          const response = await mockAPI.products.create(config.data);
          return Promise.reject({ response, isIntercepted: true });
        }
        
        // Categories endpoints
        if (url.includes('/categories')) {
          const response = await mockAPI.categories.getAll();
          return Promise.reject({ response, isIntercepted: true });
        }
        
        // Warehouses endpoints
        if (url.includes('/warehouses')) {
          const response = await mockAPI.warehouses.getAll();
          return Promise.reject({ response, isIntercepted: true });
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercept response errors to return mock data
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.isIntercepted) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );

  console.log('🔶 Mock API Active - All API calls will use mock data');
  console.log('🔶 Set USE_MOCK_API = false in apiService.js when backend is ready');
}

// ============================================
// EXPORT
// ============================================

export { USE_MOCK_API };
export default axios;