// src/lib/api/paymentUrls.js
// Comprehensive mapping of payment service URLs for debugging and data structure visualization

const BASE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:5000/api/payments';

// Payment URLs mapping
export const PAYMENT_URLS = {
  // Health Check
  health: {
    url: `${BASE_URL}/`,
    method: 'GET',
    description: 'Health check for payment service'
  },

  // ==================== Payment Routes ====================
  initiatePayment: {
    url: `${BASE_URL}/initiate`,
    method: 'POST',
    description: 'Initiate a new payment',
    sampleData: {
      amount: 50000,
      currency: 'RWF',
      paymentMethod: 'stripe', // or 'mtn', 'airtel', 'mpesa'
      shopId: 'shop_123',
      sellerId: 'seller_456',
      description: 'Product purchase'
    }
  },

  getPaymentStatus: {
    url: (paymentId) => `${BASE_URL}/status/${paymentId}`,
    method: 'GET',
    description: 'Get payment status by payment ID',
    sampleUrl: `${BASE_URL}/status/payment_789`,
    expectedResponse: {
      paymentId: 'payment_789',
      amount: 50000,
      currency: 'RWF',
      status: 'completed', // pending, completed, failed, cancelled
      paymentMethod: 'stripe',
      createdAt: '2026-01-22T10:30:00Z',
      updatedAt: '2026-01-22T10:35:00Z'
    }
  },

  getSellerPayments: {
    url: (sellerId) => `${BASE_URL}/seller/${sellerId}`,
    method: 'GET',
    description: 'Get all payments for a specific seller',
    sampleUrl: `${BASE_URL}/seller/seller_456`,
    expectedResponse: {
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
          createdAt: '2026-01-22T09:00:00Z'
        }
      ]
    }
  },

  getCompanyPayments: {
    url: (companyId) => `${BASE_URL}/company/${companyId}`,
    method: 'GET',
    description: 'Get all payments for a specific company',
    sampleUrl: `${BASE_URL}/company/company_789`,
    expectedResponse: {
      companyId: 'company_789',
      totalPayments: 100,
      totalAmount: 5000000,
      currency: 'RWF',
      payments: []
    }
  },

  getAllSettings: {
    url: `${BASE_URL}/settings/all`,
    method: 'GET',
    description: 'Get all company payment settings (debugging)',
    expectedResponse: {
      settings: [
        {
          companyId: 'company_789',
          stripeEnabled: true,
          mtnEnabled: true,
          airtelEnabled: false,
          mpesaEnabled: true
        }
      ]
    }
  },

  getShopPayments: {
    url: (shopId) => `${BASE_URL}/shop/${shopId}`,
    method: 'GET',
    description: 'Get all payments for a specific shop',
    sampleUrl: `${BASE_URL}/shop/shop_123`,
    expectedResponse: {
      shopId: 'shop_123',
      totalPayments: 50,
      totalAmount: 2500000,
      currency: 'RWF',
      payments: []
    }
  },

  cancelPayment: {
    url: (paymentId) => `${BASE_URL}/cancel/${paymentId}`,
    method: 'POST',
    description: 'Cancel a payment',
    sampleUrl: `${BASE_URL}/cancel/payment_789`,
    sampleData: {
      reason: 'Customer requested cancellation'
    },
    expectedResponse: {
      paymentId: 'payment_789',
      status: 'cancelled',
      cancelledAt: '2026-01-22T10:40:00Z'
    }
  },

  // ==================== Webhook Routes ====================
  webhooks: {
    stripe: {
      url: `${BASE_URL}/webhooks/stripe`,
      method: 'POST',
      description: 'Stripe webhook handler',
      secured: true
    },
    mtn: {
      url: `${BASE_URL}/webhooks/mtn`,
      method: 'POST',
      description: 'MTN MoMo webhook handler',
      secured: true
    },
    airtel: {
      url: `${BASE_URL}/webhooks/airtel`,
      method: 'POST',
      description: 'Airtel Money webhook handler',
      secured: true
    },
    mpesa: {
      url: `${BASE_URL}/webhooks/mpesa`,
      method: 'POST',
      description: 'M-Pesa webhook handler',
      secured: true
    }
  },

  // ==================== Transaction Routes ====================
  getSellerTransactions: {
    url: (sellerId) => `${BASE_URL}/transactions/seller/${sellerId}`,
    method: 'GET',
    description: 'Get all transactions for a seller',
    sampleUrl: `${BASE_URL}/transactions/seller/seller_456`,
    expectedResponse: {
      sellerId: 'seller_456',
      totalTransactions: 30,
      transactions: [
        {
          transactionId: 'txn_001',
          amount: 50000,
          type: 'payment', // or 'refund', 'payout'
          status: 'completed',
          createdAt: '2026-01-22T10:30:00Z'
        }
      ]
    }
  },

  getCompanyTransactions: {
    url: (companyId) => `${BASE_URL}/transactions/company/${companyId}`,
    method: 'GET',
    description: 'Get all transactions for a company',
    sampleUrl: `${BASE_URL}/transactions/company/company_789`,
    expectedResponse: {
      companyId: 'company_789',
      totalTransactions: 120,
      transactions: []
    }
  },

  getShopTransactions: {
    url: (shopId) => `${BASE_URL}/transactions/shop/${shopId}`,
    method: 'GET',
    description: 'Get all transactions for a shop',
    sampleUrl: `${BASE_URL}/transactions/shop/shop_123`,
    expectedResponse: {
      shopId: 'shop_123',
      totalTransactions: 60,
      transactions: []
    }
  },

  // ==================== Platform & Charts Routes ====================
  reports: {
    platformOverview: {
      url: `${BASE_URL}/reports/platform/overview`,
      method: 'GET',
      description: 'Platform overview for admins',
      expectedResponse: {
        totalRevenue: 50000000,
        totalPayments: 5000,
        totalCompanies: 150,
        totalShops: 500,
        currency: 'RWF'
      }
    },

    platformTopCompanies: {
      url: `${BASE_URL}/reports/platform/top-companies`,
      method: 'GET',
      description: 'Top companies by revenue',
      expectedResponse: {
        topCompanies: [
          {
            companyId: 'company_789',
            companyName: 'Company A',
            revenue: 5000000,
            paymentCount: 500,
            rank: 1
          }
        ]
      }
    },

    dashboardCharts: {
      url: `${BASE_URL}/reports/charts/dashboard`,
      method: 'GET',
      description: 'Dashboard charts data',
      expectedResponse: {
        dailyPayments: [
          { date: '2026-01-22', amount: 100000, count: 20 },
          { date: '2026-01-21', amount: 95000, count: 18 }
        ],
        paymentMethodBreakdown: [
          { method: 'stripe', percentage: 40, amount: 40000 },
          { method: 'mtn', percentage: 30, amount: 30000 },
          { method: 'mpesa', percentage: 30, amount: 30000 }
        ]
      }
    },

    sellerMonthlyTotals: {
      url: (sellerId) => `${BASE_URL}/reports/seller/${sellerId}/monthly`,
      method: 'GET',
      description: 'Get seller monthly totals',
      sampleUrl: `${BASE_URL}/reports/seller/seller_456/monthly`,
      expectedResponse: {
        sellerId: 'seller_456',
        monthlyData: [
          { month: 'January', amount: 500000, transactions: 50 },
          { month: 'December', amount: 450000, transactions: 45 }
        ]
      }
    },

    revenueSummary: {
      url: `${BASE_URL}/reports/revenue-summary`,
      method: 'GET',
      description: 'Comprehensive revenue summary (Company + Shops)',
      expectedResponse: {
        totalCompanyRevenue: 30000000,
        totalShopRevenue: 20000000,
        totalRevenue: 50000000,
        revenueByGateway: {
          stripe: 20000000,
          mtn: 15000000,
          airtel: 10000000,
          mpesa: 5000000
        }
      }
    },

    paymentStats: {
      url: `${BASE_URL}/reports/stats`,
      method: 'GET',
      description: 'Get payment statistics',
      expectedResponse: {
        totalPayments: 5000,
        successfulPayments: 4900,
        failedPayments: 100,
        successRate: 98,
        averageAmount: 10000,
        currency: 'RWF'
      }
    },

    gatewayPerformance: {
      url: `${BASE_URL}/reports/gateway-performance`,
      method: 'GET',
      description: 'Get gateway performance metrics',
      expectedResponse: {
        gateways: [
          {
            name: 'stripe',
            totalTransactions: 2000,
            successRate: 99.5,
            averageResponseTime: 1200 // ms
          }
        ]
      }
    },

    paymentTrends: {
      url: `${BASE_URL}/reports/trends`,
      method: 'GET',
      description: 'Get payment trends over time',
      expectedResponse: {
        trends: [
          { period: '2026-01-22', amount: 100000, growth: 5 },
          { period: '2026-01-21', amount: 95000, growth: 3 }
        ]
      }
    },

    exportTransactions: {
      url: `${BASE_URL}/reports/export/transactions`,
      method: 'GET',
      description: 'Export transaction history',
      expectedResponse: 'CSV file download'
    },

    shopAnalytics: {
      url: (shopId) => `${BASE_URL}/reports/shop/${shopId}/analytics`,
      method: 'GET',
      description: 'Get shop analytics',
      sampleUrl: `${BASE_URL}/reports/shop/shop_123/analytics`,
      expectedResponse: {
        shopId: 'shop_123',
        totalRevenue: 2500000,
        totalTransactions: 250,
        topProducts: [],
        paymentMethods: []
      }
    },

    companyAnalytics: {
      url: (companyId) => `${BASE_URL}/reports/company/${companyId}/analytics`,
      method: 'GET',
      description: 'Get company analytics',
      sampleUrl: `${BASE_URL}/reports/company/company_789/analytics`,
      expectedResponse: {
        companyId: 'company_789',
        totalRevenue: 5000000,
        totalTransactions: 500,
        shopCount: 5,
        topShops: []
      }
    },

    topProducts: {
      url: `${BASE_URL}/reports/top-products`,
      method: 'GET',
      description: 'Get top products by revenue',
      expectedResponse: {
        topProducts: [
          {
            productId: 'product_001',
            productName: 'Product A',
            revenue: 1000000,
            unitsSold: 500,
            rank: 1
          }
        ]
      }
    },

    payoutHistory: {
      url: `${BASE_URL}/reports/payouts`,
      method: 'GET',
      description: 'Get payout history',
      expectedResponse: {
        totalPayouts: 100,
        totalPayoutAmount: 40000000,
        payouts: [
          {
            payoutId: 'payout_001',
            amount: 500000,
            status: 'completed',
            date: '2026-01-22'
          }
        ]
      }
    }
  },

  // ==================== Invoice Routes ====================
  invoices: {
    getInvoice: {
      url: (invoiceId) => `${BASE_URL}/invoices/${invoiceId}`,
      method: 'GET',
      description: 'Get invoice by ID',
      sampleUrl: `${BASE_URL}/invoices/invoice_001`,
      expectedResponse: {
        invoiceId: 'invoice_001',
        amount: 50000,
        status: 'paid',
        issueDate: '2026-01-22',
        dueDate: '2026-02-22'
      }
    },

    getSellerInvoices: {
      url: (sellerId) => `${BASE_URL}/invoices/seller/${sellerId}`,
      method: 'GET',
      description: 'Get seller invoices',
      sampleUrl: `${BASE_URL}/invoices/seller/seller_456`,
      expectedResponse: {
        sellerId: 'seller_456',
        totalInvoices: 25,
        invoices: []
      }
    },

    getCompanyInvoices: {
      url: (companyId) => `${BASE_URL}/invoices/company/${companyId}`,
      method: 'GET',
      description: 'Get company invoices',
      sampleUrl: `${BASE_URL}/invoices/company/company_789`,
      expectedResponse: {
        companyId: 'company_789',
        totalInvoices: 100,
        invoices: []
      }
    },

    getShopInvoices: {
      url: (shopId) => `${BASE_URL}/invoices/shop/${shopId}`,
      method: 'GET',
      description: 'Get shop invoices',
      sampleUrl: `${BASE_URL}/invoices/shop/shop_123`,
      expectedResponse: {
        shopId: 'shop_123',
        totalInvoices: 50,
        invoices: []
      }
    },

    downloadInvoicePDF: {
      url: (invoiceId) => `${BASE_URL}/invoices/${invoiceId}/pdf`,
      method: 'GET',
      description: 'Download invoice PDF',
      sampleUrl: `${BASE_URL}/invoices/invoice_001/pdf`,
      expectedResponse: 'PDF file download'
    }
  }
};

/**
 * Log all payment URLs with their metadata for debugging purposes
 * This helps visualize the data structure before making actual API calls
 */
export const logPaymentUrls = () => {
  console.group('🔗 Payment API Routes Mapping');
  console.log('Base URL:', BASE_URL);
  console.log('Routes:', PAYMENT_URLS);
  console.groupEnd();
};

/**
 * Log a specific route with sample data
 * @param {string} routeName - Name of the route (e.g., 'initiatePayment')
 */
export const logPaymentRoute = (routeName) => {
  const route = PAYMENT_URLS[routeName];
  if (route) {
    console.group(`📋 Route: ${routeName}`);
    console.log('Description:', route.description);
    console.log('Method:', route.method);
    console.log('URL:', typeof route.url === 'function' ? route.url('PLACEHOLDER') : route.url);
    if (route.sampleData) {
      console.log('Sample Request Data:', route.sampleData);
    }
    if (route.expectedResponse) {
      console.log('Expected Response:', route.expectedResponse);
    }
    console.groupEnd();
  } else {
    console.warn(`Route "${routeName}" not found in PAYMENT_URLS`);
  }
};

/**
 * Log all reports routes
 */
export const logReportsRoutes = () => {
  console.group('📊 Reports Routes');
  Object.entries(PAYMENT_URLS.reports).forEach(([key, value]) => {
    console.log(`  ${key}:`, value.url);
  });
  console.groupEnd();
};

export default PAYMENT_URLS;
