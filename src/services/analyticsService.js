import apiClient from "@/lib/apiClient";

/**
 * Analytics Service for Company Admin Dashboard
 * 
 * API Pattern: GET /analytics/reports/{category}/{reportName}
 * 
 * Standard Query Parameters:
 * - startDate: ISO Date (e.g., 2024-01-01T00:00:00Z or YYYY-MM-DD)
 * - endDate: ISO Date (e.g., 2024-12-31T23:59:59Z or YYYY-MM-DD)
 * - interval: 'hour' | 'day' | 'week' | 'month' | 'year'
 * - period: Shortcut for recent timeframes ('24h' | '7d' | '30d' | '90d' | '1y')
 * - companyId: UUID (auto-filtered by backend middleware for company_admin)
 */

/**
 * Protocol Stabilizer: Converts wss:// to https:// for fetch/axios requests
 */
const getApiBase = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_SW || "http://localhost:5000";
    if (url.startsWith("wss://")) return url.replace("wss://", "https://");
    if (url.startsWith("ws://")) return url.replace("ws://", "http://");
    return url;
};

const BASE_API = getApiBase();

const AnalyticsService = {
    /**
     * Internal helper to fetch Company Reports
     * @param {string} reportPath - Path after /reports/ (e.g., 'sales/revenue')
     * @param {object} filters - Query parameters
     * @returns {Promise} Response from API
     */
    getReport: async (reportPath, filters = {}, options = {}) => {
        const params = {};

        // Date filtering
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        // Interval (hour | day | week | month | year)
        if (filters.interval) params.interval = filters.interval;

        // Company filter (usually auto-applied by backend)
        if (filters.companyId) params.companyId = filters.companyId;

        // Period shortcut (24h | 7d | 30d | 90d | 1y) - overrides startDate/endDate
        if (filters.period) params.period = filters.period;

        // Legacy support: dateRange object
        if (filters.dateRange?.start) params.startDate = filters.dateRange.start;
        if (filters.dateRange?.end) params.endDate = filters.dateRange.end;

        const baseUrl = BASE_API.endsWith('/') ? BASE_API.slice(0, -1) : BASE_API;
        const fullPath = `${baseUrl}/analytics/reports/${reportPath}`;

        if (process.env.NODE_ENV === "development") {
            console.log(`[AnalyticsService] Requesting: ${fullPath}`, params);
        }

        const response = await apiClient.get(fullPath, {
            params,
            retries: 2, // Enable retries for analytics reports
            cache: { ttl: 60 * 1000 }, // Default 1 min cache for analytics
            ...options
        });

        // Normalize response: backend returns { success: true, data: [...] }
        return response?.data?.data || response?.data || response;
    },

    // ========== 2. Sales & Financial Performance ==========

    /**
     * Revenue & Order Count over time
     * Response: [{ date, revenue, orderCount }]
     * Chart: Dual-Axis Line/Bar Chart
     */
    getRevenueReport: (filters, options = {}) => AnalyticsService.getReport('sales/revenue', filters, options),

    /**
     * Revenue, Cost, Profit, Margin
     * Response: [{ date, revenue, cost, profit, grossMarginPercent }]
     * Chart: Stacked Bar Chart with Margin Line
     */
    getProfitabilityReport: (filters, options = {}) => AnalyticsService.getReport('sales/profitability', filters, options),

    /**
     * Payment Methods Distribution (Cash, Card, Mobile)
     * Response: [{ method, count, totalAmount }]
     * Chart: Donut Chart
     */
    getPaymentMethodStats: (filters, options = {}) => AnalyticsService.getReport('sales/payment-methods', filters, options),

    /**
     * Best performing payment method
     * Response: { method, count, percentage }
     * Display: Highlight Card
     */
    getBestPaymentMethod: (filters, options = {}) => AnalyticsService.getReport('sales/payment-methods/best', filters, options),

    // ========== 3. Inventory & Operations ==========

    /**
     * Stock In vs Stock Out vs Net Flow
     * Response: [{ date, stockIn, stockOut, netFlow }]
     * Chart: Grouped Bar Chart or Diverging Bar Chart
     */
    getStockMovement: (filters, options = {}) => AnalyticsService.getReport('inventory/movement', filters, options),

    /**
     * Units sold by category
     * Response: [{ category, unitsSold, revenue }]
     * Chart: Treemap
     */
    getTrendingCategories: (filters, options = {}) => AnalyticsService.getReport('categories/trending', filters, options),

    /**
     * Sales Velocity & Total Stock
     * Response: { salesVelocity, totalStock, turnoverRate }
     * Chart: Gauge / Speedometer Chart
     */
    getInventoryHealth: (filters, options = {}) => AnalyticsService.getReport('inventory/health', filters, options),

    // ========== 4. Customer & Growth ==========

    /**
     * Daily Active Users / Monthly Active Users over time
     * Response: [{ date, dau, mau }]
     * Chart: Smooth Area Chart
     */
    getActiveUsers: (filters, options = {}) => AnalyticsService.getReport('customers/active', filters, options),

    /**
     * New customer signups over time
     * Response: [{ date, newCustomers }]
     * Chart: Vertical Bar Chart
     */
    getNewCustomerStats: (filters, options = {}) => AnalyticsService.getReport('customers/acquisition', filters, options),

    /**
     * Top spending customers
     * Response: [{ customerId, customerName, orders, totalSpent }]
     * Display: Interactive Table with sorting & pagination
     */
    getTopCustomers: (filters, options = {}) => AnalyticsService.getReport('customers/top', filters, options),

    // ========== 5. Staff & Shops Performance ==========

    /**
     * Revenue per shop
     * Response: [{ shopId, shopName, totalRevenue, orderCount }]
     * Chart: Vertical Bar Chart
     */
    getShopPerformance: (filters, options = {}) => AnalyticsService.getReport('shops/performance', filters, options),

    /**
     * Sales per employee
     * Response: [{ employeeId, employeeName, totalSales, orderCount }]
     * Display: Leaderboard / Ranked List
     */
    getEmployeePerformance: (filters, options = {}) => AnalyticsService.getReport('employees/performance', filters, options),

    // ========== Product Analytics ==========

    /**
     * Top selling products
     * Response: [{ productId, productName, totalQuantity, totalRevenue }]
     * Chart: Horizontal Bar Chart
     */
    getTopProducts: (filters, options = {}) => AnalyticsService.getReport('products/top', filters, options),

    /**
     * Product return rates
     * Response: [{ productId, productName, returnCount, returnRate }]
     * Chart: Bar Chart or Table
     */
    getReturnRates: (filters, options = {}) => AnalyticsService.getReport('products/returns', filters, options),

    // ========== Dashboard Summary ==========

    /**
     * Dashboard Overview (uses Revenue Report as Company Admin summary)
     * For company admins, this provides key metrics for the selected period
     */
    getDashboardSummary: async (filters, options = {}) => {
        try {
            // Fetch multiple quick stats in parallel for the dashboard cards
            const [revenue, profitability, returns, categories] = await Promise.all([
                AnalyticsService.getRevenueReport(filters, options).catch((err) => {
                    console.warn('[AnalyticsService] Revenue report failed:', err.message || err);
                    return [];
                }),
                AnalyticsService.getProfitabilityReport(filters, options).catch((err) => {
                    console.warn('[AnalyticsService] Profitability report failed:', err.message || err);
                    return [];
                }),
                AnalyticsService.getReturnRates(filters, options).catch((err) => {
                    console.warn('[AnalyticsService] Return Rates statistics failed:', err.message || err);
                    return [];
                }),
                AnalyticsService.getPaymentMethodStats(filters, options).catch((err) => {
                    console.warn('[AnalyticsService] Payment Method statistics failed:', err.message || err);
                    return [];
                })
            ]);

            // Calculate summary metrics from the reports
            const totalRevenue = revenue.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0);
            const totalProfit = profitability.reduce((sum, item) => sum + parseFloat(item.profit || 0), 0);
            const totalReturns = Array.isArray(returns) ? returns.reduce((sum, item) => sum + parseInt(item.returnCount || 0), 0) : 0;
            const totalOrders = revenue.reduce((sum, item) => sum + parseInt(item.orderCount || 0), 0);

            return {
                totalDailySales: totalRevenue.toFixed(2),
                totalDailyProfit: totalProfit.toFixed(2),
                totalReturnedProducts: totalReturns,
                totalDiscounts: 0, // This would need a dedicated endpoint
                totalOrders: totalOrders,
                paymentMethods: categories
            };
        } catch (error) {
            console.error('[AnalyticsService] Dashboard Summary Critical Failure:', error.message || error, error);
            return {
                totalDailySales: 0,
                totalDailyProfit: 0,
                totalReturnedProducts: 0,
                totalDiscounts: 0,
                totalOrders: 0
            };
        }
    },

    // ========== Export ==========

    /**
     * Export analytics report
     * Response: File download or export URL
     */
    exportReport: (filters, options = {}) => AnalyticsService.getReport('export', filters, options),
};

export default AnalyticsService;
