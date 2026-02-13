/**
 * Payment API Endpoints Mapping
 * Maps all payment service endpoints with sample request/response structures
 * Logs comprehensive API information to browser console
 */

const PAYMENT_API_ENDPOINTS = {
  // ==================== PAYMENT ENDPOINTS ====================
  PAYMENT: {
    initiatePayment: {
      method: 'POST',
      path: '/api/payments/initiate',
      description: 'Initiate a new payment transaction',
      requestBody: {
        amount: 50000,
        currency: 'RWF',
        shopId: 'shop_123',
        paymentMethod: 'stripe',
        description: 'Product purchase',
      },
      responseStructure: {
        paymentId: 'payment_001',
        status: 'pending',
        amount: 50000,
        currency: 'RWF',
        createdAt: '2026-01-22T09:00:00Z',
        redirectUrl: 'https://stripe.com/pay/...',
      },
    },

    getPaymentStatus: {
      method: 'GET',
      path: '/api/payments/status/:payment_id',
      description: 'Get the current status of a payment',
      params: { payment_id: 'payment_001' },
      responseStructure: {
        paymentId: 'payment_001',
        status: 'completed',
        amount: 50000,
        currency: 'RWF',
        paymentMethod: 'stripe',
        createdAt: '2026-01-22T09:00:00Z',
        completedAt: '2026-01-22T09:05:00Z',
      },
    },

    getSellerPayments: {
      method: 'GET',
      path: '/api/payments/seller/:seller_id',
      description: 'Get all payments for a specific seller',
      params: { seller_id: 'seller_456' },
      responseStructure: {
        sellerId: 'seller_456',
        totalPayments: 25,
        totalAmount: 1250000,
        currency: 'RWF',
        payments: [
          {
            paymentId: 'payment_001',
            amount: 50000,
            status: 'completed',
            paymentMethod: 'stripe',
            createdAt: '2026-01-22T09:00:00Z',
          },
        ],
      },
    },

    getCompanyPayments: {
      method: 'GET',
      path: '/api/payments/company/:company_id',
      description: 'Get all payments for a specific company',
      params: { company_id: 'company_123' },
      responseStructure: {
        companyId: 'company_123',
        totalPayments: 50,
        totalAmount: 2500000,
        currency: 'RWF',
        payments: [],
      },
    },

    getShopPayments: {
      method: 'GET',
      path: '/api/payments/shop/:shop_id',
      description: 'Get all payments for a specific shop',
      params: { shop_id: 'shop_456' },
      responseStructure: {
        shopId: 'shop_456',
        totalPayments: 15,
        totalAmount: 750000,
        currency: 'RWF',
        payments: [],
      },
    },

    cancelPayment: {
      method: 'POST',
      path: '/api/payments/cancel/:payment_id',
      description: 'Cancel a pending payment',
      params: { payment_id: 'payment_001' },
      requestBody: {
        reason: 'Customer request',
      },
      responseStructure: {
        paymentId: 'payment_001',
        status: 'cancelled',
        cancelledAt: '2026-01-22T09:10:00Z',
      },
    },

    getAllSettings: {
      method: 'GET',
      path: '/api/payments/settings/all',
      description: 'Get all company payment settings (debugging)',
      responseStructure: {
        companies: [
          {
            companyId: 'company_123',
            name: 'Acme Corp',
            settings: {
              stripeEnabled: true,
              mtnEnabled: true,
              airtelEnabled: false,
              mpesaEnabled: true,
            },
          },
        ],
      },
    },
  },

  // ==================== TRANSACTION ENDPOINTS ====================
  TRANSACTIONS: {
    getSellerTransactions: {
      method: 'GET',
      path: '/api/payments/transactions/seller/:seller_id',
      description: 'Get all transactions for a specific seller',
      params: { seller_id: 'seller_456' },
      responseStructure: {
        sellerId: 'seller_456',
        totalTransactions: 30,
        totalAmount: 1500000,
        transactions: [
          {
            transactionId: 'txn_001',
            paymentId: 'payment_001',
            amount: 50000,
            type: 'payment',
            status: 'completed',
            createdAt: '2026-01-22T09:00:00Z',
          },
        ],
      },
    },

    getCompanyTransactions: {
      method: 'GET',
      path: '/api/payments/transactions/company/:company_id',
      description: 'Get all transactions for a specific company',
      params: { company_id: 'company_123' },
      responseStructure: {
        companyId: 'company_123',
        totalTransactions: 60,
        totalAmount: 3000000,
        transactions: [],
      },
    },

    getShopTransactions: {
      method: 'GET',
      path: '/api/payments/transactions/shop/:shop_id',
      description: 'Get all transactions for a specific shop',
      params: { shop_id: 'shop_456' },
      responseStructure: {
        shopId: 'shop_456',
        totalTransactions: 20,
        totalAmount: 1000000,
        transactions: [],
      },
    },
  },

  // ==================== INVOICE ENDPOINTS ====================
  INVOICES: {
    getInvoice: {
      method: 'GET',
      path: '/api/payments/invoices/:invoice_id',
      description: 'Get a specific invoice by ID',
      params: { invoice_id: 'invoice_001' },
      responseStructure: {
        invoiceId: 'invoice_001',
        paymentId: 'payment_001',
        sellerId: 'seller_456',
        amount: 50000,
        currency: 'RWF',
        status: 'paid',
        createdAt: '2026-01-22T09:00:00Z',
        items: [
          {
            itemId: 'item_001',
            description: 'Product A',
            quantity: 1,
            unitPrice: 50000,
            total: 50000,
          },
        ],
      },
    },

    getSellerInvoices: {
      method: 'GET',
      path: '/api/payments/invoices/seller/:seller_id',
      description: 'Get all invoices for a specific seller',
      params: { seller_id: 'seller_456' },
      responseStructure: {
        sellerId: 'seller_456',
        totalInvoices: 25,
        totalAmount: 1250000,
        invoices: [],
      },
    },

    getCompanyInvoices: {
      method: 'GET',
      path: '/api/payments/invoices/company/:company_id',
      description: 'Get all invoices for a specific company',
      params: { company_id: 'company_123' },
      responseStructure: {
        companyId: 'company_123',
        totalInvoices: 50,
        totalAmount: 2500000,
        invoices: [],
      },
    },

    getShopInvoices: {
      method: 'GET',
      path: '/api/payments/invoices/shop/:shop_id',
      description: 'Get all invoices for a specific shop',
      params: { shop_id: 'shop_456' },
      responseStructure: {
        shopId: 'shop_456',
        totalInvoices: 15,
        totalAmount: 750000,
        invoices: [],
      },
    },

    downloadInvoicePDF: {
      method: 'GET',
      path: '/api/payments/invoices/:invoice_id/pdf',
      description: 'Download invoice as PDF',
      params: { invoice_id: 'invoice_001' },
      responseStructure: {
        message: 'PDF generated successfully',
        downloadUrl: 'https://api.invexix.com/downloads/invoice_001.pdf',
        fileName: 'invoice_001.pdf',
      },
    },
  },

  // ==================== REPORTING ENDPOINTS ====================
  REPORTS: {
    platformOverview: {
      method: 'GET',
      path: '/api/payments/reports/platform/overview',
      description: 'Get platform-wide overview (Admin)',
      responseStructure: {
        totalRevenue: 50000000,
        totalTransactions: 2000,
        totalCompanies: 50,
        totalSellers: 500,
        activePaymentMethods: 4,
        pendingPayments: 15,
        failedPayments: 5,
      },
    },

    topCompanies: {
      method: 'GET',
      path: '/api/payments/reports/platform/top-companies',
      description: 'Get top performing companies (Admin)',
      responseStructure: {
        topCompanies: [
          {
            rank: 1,
            companyId: 'company_001',
            name: 'Company A',
            totalRevenue: 5000000,
            totalTransactions: 200,
          },
        ],
      },
    },

    dashboardCharts: {
      method: 'GET',
      path: '/api/payments/reports/charts/dashboard',
      description: 'Get data for dashboard charts',
      responseStructure: {
        dailyRevenue: [
          { date: '2026-01-22', revenue: 500000 },
          { date: '2026-01-21', revenue: 450000 },
        ],
        paymentMethods: [
          { method: 'stripe', count: 500, amount: 10000000 },
          { method: 'mtn', count: 300, amount: 6000000 },
        ],
        topProducts: [
          { productId: 'prod_001', name: 'Product A', sales: 100 },
        ],
      },
    },

    sellerMonthlyTotals: {
      method: 'GET',
      path: '/api/payments/reports/seller/:seller_id/monthly',
      description: 'Get seller monthly payment totals',
      params: { seller_id: 'seller_456' },
      responseStructure: {
        sellerId: 'seller_456',
        monthly: [
          {
            month: '2026-01',
            totalAmount: 500000,
            totalTransactions: 25,
            byPaymentMethod: {
              stripe: 300000,
              mtn: 200000,
            },
          },
        ],
      },
    },

    revenueSummary: {
      method: 'GET',
      path: '/api/payments/reports/revenue-summary',
      description: 'Get comprehensive revenue summary (Company + Shops)',
      responseStructure: {
        period: 'month',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        companyRevenue: 2500000,
        shopRevenue: 1500000,
        totalRevenue: 4000000,
        breakdown: {
          byPaymentMethod: {},
          byCompany: {},
          byShop: {},
        },
      },
    },

    paymentStats: {
      method: 'GET',
      path: '/api/payments/reports/stats',
      description: 'Get payment statistics',
      responseStructure: {
        totalPayments: 2000,
        completedPayments: 1850,
        pendingPayments: 100,
        failedPayments: 50,
        successRate: 92.5,
        averageAmount: 25000,
        medianAmount: 20000,
      },
    },

    gatewayPerformance: {
      method: 'GET',
      path: '/api/payments/reports/gateway-performance',
      description: 'Get payment gateway performance metrics',
      responseStructure: {
        gateways: [
          {
            gateway: 'stripe',
            transactions: 500,
            successCount: 480,
            failureCount: 20,
            successRate: 96,
            averageTime: 2.5,
          },
        ],
      },
    },

    paymentTrends: {
      method: 'GET',
      path: '/api/payments/reports/trends',
      description: 'Get payment trends over time',
      responseStructure: {
        trends: [
          {
            date: '2026-01-22',
            totalAmount: 500000,
            transactionCount: 50,
            uniqueCustomers: 45,
          },
        ],
      },
    },

    exportTransactions: {
      method: 'GET',
      path: '/api/payments/reports/export/transactions',
      description: 'Export transaction history',
      responseStructure: {
        message: 'Export generated',
        downloadUrl: 'https://api.invexix.com/downloads/transactions_2026_01.csv',
        fileName: 'transactions_2026_01.csv',
        recordCount: 2000,
      },
    },

    shopAnalytics: {
      method: 'GET',
      path: '/api/payments/reports/shop/:shop_id/analytics',
      description: 'Get analytics for a specific shop',
      params: { shop_id: 'shop_456' },
      responseStructure: {
        shopId: 'shop_456',
        shopName: 'Shop Name',
        totalRevenue: 750000,
        totalTransactions: 150,
        topProducts: [],
        paymentMethodBreakdown: {},
      },
    },

    companyAnalytics: {
      method: 'GET',
      path: '/api/payments/reports/company/:company_id/analytics',
      description: 'Get analytics for a specific company',
      params: { company_id: 'company_123' },
      responseStructure: {
        companyId: 'company_123',
        companyName: 'Company Name',
        totalRevenue: 2500000,
        totalTransactions: 300,
        topShops: [],
        paymentMethodBreakdown: {},
      },
    },

    topProducts: {
      method: 'GET',
      path: '/api/payments/reports/top-products',
      description: 'Get top selling products by revenue',
      responseStructure: {
        topProducts: [
          {
            rank: 1,
            productId: 'prod_001',
            name: 'Product A',
            totalSales: 1000000,
            unitsSold: 500,
            averagePrice: 2000,
          },
        ],
      },
    },

    payoutHistory: {
      method: 'GET',
      path: '/api/payments/reports/payouts',
      description: 'Get seller/shop payout history',
      responseStructure: {
        payouts: [
          {
            payoutId: 'payout_001',
            sellerId: 'seller_456',
            amount: 500000,
            status: 'completed',
            createdAt: '2026-01-22T09:00:00Z',
            completedAt: '2026-01-23T10:00:00Z',
          },
        ],
      },
    },
  },

  // ==================== WEBHOOK ENDPOINTS ====================
  WEBHOOKS: {
    stripeWebhook: {
      method: 'POST',
      path: '/api/payments/webhooks/stripe',
      description: 'Stripe webhook handler',
      eventTypes: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
    },

    mtnWebhook: {
      method: 'POST',
      path: '/api/payments/webhooks/mtn',
      description: 'MTN MoMo webhook handler',
      eventTypes: ['payment.success', 'payment.failed'],
    },

    airtelWebhook: {
      method: 'POST',
      path: '/api/payments/webhooks/airtel',
      description: 'Airtel Money webhook handler',
      eventTypes: ['transaction.success', 'transaction.failed'],
    },

    mpesaWebhook: {
      method: 'POST',
      path: '/api/payments/webhooks/mpesa',
      description: 'M-Pesa webhook handler',
      eventTypes: ['mpesa.success', 'mpesa.failed'],
    },
  },
};

// Export for use in other modules
export default PAYMENT_API_ENDPOINTS;

/**
 * Helper function to log endpoint details
 */
export const logEndpointDetails = (category, endpointName) => {
  const categoryData = PAYMENT_API_ENDPOINTS[category];
  if (!categoryData) {
    console.error(`%cCategory not found: ${category}`, 'color: #ff0000;');
    return;
  }

  const endpoint = categoryData[endpointName];
  if (!endpoint) {
    console.error(`%cEndpoint not found: ${endpointName}`, 'color: #ff0000;');
    return;
  }

  console.log('%c📋 ENDPOINT DETAILS', 'color: #00ffff; font-weight: bold; font-size: 12px;');
  console.log(`%cName: %c${endpointName}`, 'color: #666; font-weight: bold;', 'color: #0080ff; font-family: monospace;');
  console.log(`%cMethod: %c${endpoint.method}`, 'color: #666; font-weight: bold;', 'color: #ff6600; font-family: monospace;');
  console.log(`%cPath: %c${endpoint.path}`, 'color: #666; font-weight: bold;', 'color: #00aa00; font-family: monospace;');
  console.log(`%cDescription: %c${endpoint.description}`, 'color: #666; font-weight: bold;', 'color: #333;');

  if (endpoint.params) {
    console.log('%cParameters:', 'color: #666; font-weight: bold;');
    console.log(endpoint.params);
  }

  if (endpoint.requestBody) {
    console.log('%cRequest Body:', 'color: #666; font-weight: bold;');
    console.log(endpoint.requestBody);
  }

  if (endpoint.responseStructure) {
    console.log('%cResponse Structure:', 'color: #666; font-weight: bold;');
    console.log(endpoint.responseStructure);
  }

  if (endpoint.eventTypes) {
    console.log('%cEvent Types:', 'color: #666; font-weight: bold;');
    console.log(endpoint.eventTypes);
  }
};

/**
 * Helper function to log all endpoints in a category
 */
export const logCategoryEndpoints = (category) => {
  const categoryData = PAYMENT_API_ENDPOINTS[category];
  if (!categoryData) {
    console.error(`%cCategory not found: ${category}`, 'color: #ff0000;');
    return;
  }

  console.log(`%c📚 ${category} ENDPOINTS`, 'color: #ffff00; font-weight: bold; font-size: 13px;');
  Object.keys(categoryData).forEach((key, index) => {
    const endpoint = categoryData[key];
    console.log(`  ${index + 1}. ${key.padEnd(30)} [${endpoint.method.padEnd(6)}] ${endpoint.path}`);
  });
};

/**
 * Log all available endpoints
 */
export const logAllEndpoints = () => {
  console.log('%c╔════════════════════════════════════════════════════════════╗', 'color: #00ff00; font-size: 12px;');
  console.log('%c║           COMPLETE PAYMENT API ENDPOINTS MAP              ║', 'color: #00ff00; font-size: 13px; font-weight: bold;');
  console.log('%c╚════════════════════════════════════════════════════════════╝', 'color: #00ff00; font-size: 12px;');

  Object.keys(PAYMENT_API_ENDPOINTS).forEach((category) => {
    logCategoryEndpoints(category);
    console.log('');
  });
};
