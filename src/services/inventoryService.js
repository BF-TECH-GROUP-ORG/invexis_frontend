import apiClient from "@/lib/apiClient";
import dayjs from "dayjs";

// --- MOCK DATA FOR DEVELOPMENT ---
const MOCK_SUMMARY = {
  totalUnits: 12450,
  totalValue: 845200.0,
  marketingValue: 1200000.0,
  netStockMovement: 1450, // Positive = net in, Negative = net out
  grossProfit: 154000.0,
  lowStockCount: 24,
  stockoutRiskCount: 8,
};

const MOCK_STATUS_DISTRIBUTION = [
  { name: "In Stock", value: 3800, fill: "#10b981" }, // Emerald 500
  { name: "Low Stock", value: 300, fill: "#f59e0b" }, // Amber 500
  { name: "Out of Stock", value: 120, fill: "#ef4444" }, // Red 500
  { name: "Reserved", value: 450, fill: "#6366f1" }, // Indigo 500
];

const MOCK_VALUE_DISTRIBUTION = [
  { name: "Electronics", value: 450000, fill: "#3b82f6" }, // Blue 500
  { name: "Accessories", value: 150000, fill: "#8b5cf6" }, // Violet 500
  { name: "Spare Parts", value: 80000, fill: "#ec4899" }, // Pink 500
  { name: "Tools", value: 45000, fill: "#14b8a6" }, // Teal 500
];

const MOCK_MOVEMENT_TREND = Array.from({ length: 12 })
  .map((_, i) => ({
    width: "100%",
    month: dayjs()
      .subtract(11 - i, "month")
      .format("MMM"),
    stockIn: Math.floor(Math.random() * 5000) + 1000,
    stockOut: Math.floor(Math.random() * 4000) + 500,
    netChange: 0, // Calculated later
  }))
  .map((d) => ({ ...d, netChange: d.stockIn - d.stockOut }));

const MOCK_PROFIT_TREND = Array.from({ length: 12 })
  .map((_, i) => ({
    month: dayjs()
      .subtract(11 - i, "month")
      .format("MMM"),
    revenue: Math.floor(Math.random() * 80000) + 20000,
    cost: Math.floor(Math.random() * 50000) + 10000,
    profit: 0, // Calculated
  }))
  .map((d) => ({ ...d, profit: d.revenue - d.cost }));

const MOCK_TOP_PRODUCTS = [
  {
    id: 1,
    name: "Premium Widget X1",
    profit: 12500,
    unitsSold: 450,
    image: null,
  },
  {
    id: 2,
    name: "Advanced Gadget Pro",
    profit: 9800,
    unitsSold: 210,
    image: null,
  },
  {
    id: 3,
    name: "Basic Component A",
    profit: 7600,
    unitsSold: 1200,
    image: null,
  },
  {
    id: 4,
    name: "Office Kit Deluxe",
    profit: 5400,
    unitsSold: 85,
    image: null,
  },
  { id: 5, name: "Ergo Chair Ultra", profit: 3200, unitsSold: 40, image: null },
];

const MOCK_RISK_PRODUCTS = [
  {
    id: 101,
    name: "Graphics Card 4090",
    remainingDays: 2,
    stock: 5,
    burnRate: 2.5,
  },
  {
    id: 102,
    name: "Wireless Earbuds",
    remainingDays: 4,
    stock: 12,
    burnRate: 3.0,
  },
  {
    id: 103,
    name: "PowerBank 20k",
    remainingDays: 5,
    stock: 15,
    burnRate: 3.0,
  },
  {
    id: 104,
    name: "USB-C Cable 3m",
    remainingDays: 7,
    stock: 25,
    burnRate: 3.5,
  },
];

const MOCK_SHOP_PERFORMANCE = [
  { name: "Downtown Store", revenue: 150000, units: 1200 },
  { name: "Mall Plaza", revenue: 120000, units: 950 },
  { name: "Online Warehouse", revenue: 450000, units: 3500 },
];

const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: "RESTOCK",
    item: "Widget X1",
    quantity: 50,
    user: "Admin",
    time: "2h ago",
  },
  {
    id: 2,
    type: "SALE",
    item: "Gadget Pro",
    quantity: -2,
    user: "System",
    time: "10m ago",
  },
  {
    id: 3,
    type: "ADJUSTMENT",
    item: "Broken Screen",
    quantity: -1,
    user: "Manager",
    time: "1d ago",
  },
];

// --- SERVICE IMPLEMENTATION ---

const InventoryService = {
  /**
   * Get high-level inventory summary KPI data
   */
  getSummary: async (companyId) => {
    // const response = await apiClient.get(`/companies/${companyId}/inventory-summary`);
    // return response.data;
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_SUMMARY), 600)
    );
  },

  /**
   * Get inventory status distribution (Start, Low, Out)
   */
  getStatusDistribution: async (companyId) => {
    // const response = await apiClient.get(`/companies/${companyId}/inventory-summary`);
    // return response.data.distribution; // Adapting structure
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_STATUS_DISTRIBUTION), 700)
    );
  },

  /**
   * Get inventory value distribution by category/type
   */
  getValueDistribution: async (companyId) => {
    // const response = await apiClient.get(`/companies/${companyId}/inventory-value-dist`); // Hypothetical endpoint
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_VALUE_DISTRIBUTION), 750)
    );
  },

  /**
   * Get stock movement trends (in/out/net)
   */
  getMovementTrend: async (period = "year") => {
    // const response = await apiClient.get(`/analytics/graphs/inventory-trends`, { params: { period } });
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_MOVEMENT_TREND), 800)
    );
  },

  /**
   * Get profit and cost trends
   */
  getFinancialTrend: async (period = "year") => {
    // const response = await apiClient.get(`/analytics/graphs/profit-comparison`, { params: { period } });
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_PROFIT_TREND), 800)
    );
  },

  /**
   * Get top products by profit
   */
  getTopProducts: async (limit = 5) => {
    // const response = await apiClient.get(`/analytics/top-products`, { params: { limit } });
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_TOP_PRODUCTS), 650)
    );
  },

  /**
   * Get products at risk of stockout
   */
  getStockoutRisks: async (thresholdDays = 7) => {
    // const response = await apiClient.get(`/analytics/stockout-risk`, { params: { thresholdDays } });
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_RISK_PRODUCTS), 600)
    );
  },

  /**
   * Get shop performance comparison
   */
  getShopPerformance: async (companyId) => {
    // const response = await apiClient.get(`/companies/${companyId}/shops/performance`);
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_SHOP_PERFORMANCE), 900)
    );
  },

  /**
   * Get recent inventory activities/logs
   */
  getRecentActivities: async (limit = 10) => {
    // const response = await apiClient.get(`/stock-changes`, { params: { limit } });
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_ACTIVITIES), 500)
    );
  },

  /**
   * Get recently added products
   */
  getRecentProducts: async (limit = 5) => {
    // const response = await apiClient.get(`/products`, { params: { sort: 'createdAt', limit } });
    // Mock data
    const MOCK_RECENT_PRODUCTS = [
      { id: 201, name: "New Gadget Z", addedBy: "Admin", status: "Active" },
      { id: 202, name: "Smart Watch V2", addedBy: "Manager", status: "Draft" },
      { id: 203, name: "Wireless Charger", addedBy: "Admin", status: "Active" },
    ];
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_RECENT_PRODUCTS), 550)
    );
  },
};

export default InventoryService;
