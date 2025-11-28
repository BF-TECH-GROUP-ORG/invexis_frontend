// src/utils/mockData.js
// Mock data until backend APIs are ready

export const mockCategories = [
  {
    _id: "cat_001",
    name: "Electronics",
    level: 1,
    description: "Electronic devices and accessories"
  },
  {
    _id: "cat_002",
    name: "Smartphones",
    level: 2,
    description: "Mobile phones and accessories"
  },
  {
    _id: "cat_003",
    name: "Laptops",
    level: 2,
    description: "Laptop computers"
  },
  {
    _id: "cat_004",
    name: "Tablets",
    level: 2,
    description: "Tablet devices"
  },
  {
    _id: "cat_005",
    name: "Clothing",
    level: 1,
    description: "Apparel and fashion"
  },
  {
    _id: "cat_006",
    name: "Men's Wear",
    level: 2,
    description: "Men's clothing"
  },
  {
    _id: "cat_007",
    name: "Women's Wear",
    level: 2,
    description: "Women's clothing"
  },
  {
    _id: "cat_008",
    name: "Home & Garden",
    level: 1,
    description: "Home improvement and garden supplies"
  },
  {
    _id: "cat_009",
    name: "Furniture",
    level: 2,
    description: "Home furniture"
  },
  {
    _id: "cat_010",
    name: "Sports & Outdoors",
    level: 1,
    description: "Sports equipment and outdoor gear"
  }
];

export const mockWarehouses = [
  {
    _id: "wh_001",
    name: "Main Warehouse",
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
      address: "123 Main St"
    },
    capacity: 10000,
    currentStock: 7500
  },
  {
    _id: "wh_002",
    name: "West Coast Distribution Center",
    location: {
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      address: "456 West Ave"
    },
    capacity: 15000,
    currentStock: 12000
  },
  {
    _id: "wh_003",
    name: "East Coast Hub",
    location: {
      city: "Boston",
      state: "MA",
      country: "USA",
      address: "789 East Blvd"
    },
    capacity: 8000,
    currentStock: 5000
  },
  {
    _id: "wh_004",
    name: "Midwest Storage",
    location: {
      city: "Chicago",
      state: "IL",
      country: "USA",
      address: "321 Central Rd"
    },
    capacity: 12000,
    currentStock: 9000
  },
  {
    _id: "wh_005",
    name: "Southern Depot",
    location: {
      city: "Atlanta",
      state: "GA",
      country: "USA",
      address: "654 South St"
    },
    capacity: 9000,
    currentStock: 6500
  }
];

export const mockProducts = [
  {
    _id: "prod_001",
    name: "iPhone 15 Pro",
    sku: "APL-IP15P-256-BLK",
    category: "cat_002",
    price: 999.99,
    costPrice: 750.00,
    stock: 150,
    warehouse: "wh_001",
    status: "active"
  },
  {
    _id: "prod_002",
    name: "Samsung Galaxy S24",
    sku: "SAM-GS24-128-WHT",
    category: "cat_002",
    price: 849.99,
    costPrice: 650.00,
    stock: 200,
    warehouse: "wh_001",
    status: "active"
  },
  {
    _id: "prod_003",
    name: "MacBook Pro 16\"",
    sku: "APL-MBP16-512-SLV",
    category: "cat_003",
    price: 2499.99,
    costPrice: 2000.00,
    stock: 75,
    warehouse: "wh_002",
    status: "active"
  }
];

// Simulated API delay (makes it feel like real API)
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions
export const mockApi = {
  // Get categories
  getCategories: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockCategories,
      total: mockCategories.length
    };
  },

  // Get warehouses
  getWarehouses: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockWarehouses,
      total: mockWarehouses.length
    };
  },

  // Get products
  getProducts: async () => {
    await simulateApiDelay();
    return {
      success: true,
      data: mockProducts,
      total: mockProducts.length
    };
  },

  // Create product
  createProduct: async (productData) => {
    await simulateApiDelay();
    const newProduct = {
      _id: `prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString()
    };
    return {
      success: true,
      data: newProduct,
      message: "Product created successfully"
    };
  },

  // Update product
  updateProduct: async (productId, productData) => {
    await simulateApiDelay();
    return {
      success: true,
      data: { _id: productId, ...productData },
      message: "Product updated successfully"
    };
  },

  // Delete product
  deleteProduct: async (productId) => {
    await simulateApiDelay();
    return {
      success: true,
      message: "Product deleted successfully"
    };
  }
};