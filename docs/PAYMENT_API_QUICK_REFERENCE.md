// QUICK REFERENCE: Payment API Console Testing

## Browser Console Commands (Try These Immediately!)

### 1. Show all endpoints
```javascript
paymentTester.listEndpoints()
```

### 2. Inspect specific endpoint
```javascript
// Daily Payments Data
paymentTester.endpoint('getSellerPayments')

// Daily Transactions
paymentTester.endpoint('getSellerTransactions')

// Most Used Payment Method (Dashboard Charts)
paymentTester.endpoint('dashboardCharts')

// Platform Overview
paymentTester.endpoint('platformOverview')
```

### 3. Test endpoint with mock data
```javascript
// Mock the payment initiation
paymentTester.test('initiatePayment')

// Check what data structure is expected for seller payments
paymentTester.test('getSellerPayments')
```

### 4. Generate CURL commands
```javascript
// For testing in terminal/Postman
paymentTester.curl('getSellerPayments', 'seller_456')
paymentTester.curl('initiatePayment')
```

### 5. Make actual API call (when backend is ready)
```javascript
// Get seller payments
const payments = await paymentTester.fetch('getSellerPayments', 'seller_456')
console.log(payments)

// Initiate a payment
const result = await paymentTester.fetch('initiatePayment', null, {
  amount: 50000,
  currency: 'RWF',
  shopId: 'shop_123'
})
```

---

## For the Payment Cards, You Need:

### Card 1: Daily Payments
```javascript
// Console Command:
paymentTester.endpoint('getSellerPayments')

// Expected Response Structure:
{
  sellerId: 'seller_456',
  totalPayments: 25,
  totalAmount: 1250000,  // This is your card value
  currency: 'RWF',
  payments: [...]
}

// API URL:
GET /api/payments/seller/{seller_id}
```

### Card 2: Daily Transactions
```javascript
// Console Command:
paymentTester.endpoint('getSellerTransactions')

// Expected Response Structure:
{
  sellerId: 'seller_456',
  totalTransactions: 30,
  transactions: [
    {
      transactionId: 'txn_001',
      amount: 50000,
      type: 'payment',
      status: 'completed',
      createdAt: '2026-01-22T10:30:00Z'
    }
  ]
}

// API URL:
GET /api/payments/transactions/seller/{seller_id}
```

### Card 3: Most Used Method
```javascript
// Console Command:
paymentTester.endpoint('dashboardCharts')

// Expected Response Structure:
{
  dailyPayments: [...],
  paymentMethodBreakdown: [
    { method: 'stripe', percentage: 40, amount: 40000 },
    { method: 'mtn', percentage: 30, amount: 30000 },
    { method: 'mpesa', percentage: 30, amount: 30000 }
  ]
}

// API URL:
GET /api/payments/reports/charts/dashboard

// Most used = highest percentage
```

---

## Endpoint Categories Available:

### Payment Management
- initiatePayment ........................... POST /initiate
- getPaymentStatus ......................... GET /status/{payment_id}
- cancelPayment ............................ POST /cancel/{payment_id}

### Payment Data
- getSellerPayments ........................ GET /seller/{seller_id}
- getCompanyPayments ....................... GET /company/{company_id}
- getShopPayments .......................... GET /shop/{shop_id}

### Transactions
- getSellerTransactions .................... GET /transactions/seller/{seller_id}
- getCompanyTransactions ................... GET /transactions/company/{company_id}
- getShopTransactions ...................... GET /transactions/shop/{shop_id}

### Reporting & Analytics
- platformOverview ......................... GET /reports/platform/overview
- platformTopCompanies ..................... GET /reports/platform/top-companies
- dashboardCharts .......................... GET /reports/charts/dashboard
- paymentStats ............................. GET /reports/stats
- gatewayPerformance ....................... GET /reports/gateway-performance
- paymentTrends ............................ GET /reports/trends
- revenueSummary ........................... GET /reports/revenue-summary

### Invoices
- getInvoice ............................... GET /invoices/{invoice_id}
- getSellerInvoices ........................ GET /invoices/seller/{seller_id}
- getCompanyInvoices ....................... GET /invoices/company/{company_id}
- getShopInvoices .......................... GET /invoices/shop/{shop_id}
- downloadInvoicePDF ....................... GET /invoices/{invoice_id}/pdf

### Webhooks (Not for testing directly)
- Stripe, MTN, Airtel, M-Pesa

---

## Step-by-Step Integration Guide

### Step 1: Console Testing (RIGHT NOW)
```javascript
// Open Browser Console (F12)
// Type these commands to see data structure:
paymentTester.listEndpoints()
paymentTester.endpoint('getSellerPayments')
paymentTester.endpoint('getSellerTransactions')
paymentTester.endpoint('dashboardCharts')
```

### Step 2: Understand Response Format
```javascript
// See exactly what data each API returns
paymentTester.test('getSellerPayments')
```

### Step 3: Mock API (Without Real Backend Call)
```javascript
// Component useEffect example:
useEffect(() => {
  // Log what we'll be calling
  paymentTester.endpoint('getSellerPayments')
  
  // This is what the response will look like:
  const mockData = {
    sellerId: 'seller_456',
    totalPayments: 25,
    totalAmount: 1250000,
    currency: 'RWF'
  }
  
  // Update your card with mockData.totalAmount
}, [])
```

### Step 4: Real API Call (When Backend Ready)
```javascript
// Replace mock data with actual call
useEffect(() => {
  const fetchPayments = async () => {
    const data = await paymentTester.fetch('getSellerPayments', 'seller_456')
    // Update state with data.totalAmount
  }
  
  fetchPayments()
}, [])
```

---

## Environment Setup

Make sure in `.env.local`:
```
NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:5000/api/payments
```

---

## Troubleshooting

**Q: `paymentTester is not defined`**
- A: Reload the page, the tester loads on page mount

**Q: API returns error**
- A: Check console for auth token issues
- A: Verify backend is running at the URL in env

**Q: Data structure different than expected**
- A: Use `paymentTester.endpoint()` to see what's expected
- A: Use `paymentTester.compare()` to compare actual vs expected

**Q: Need custom data in test**
- A: `paymentTester.test('initiatePayment', { amount: 100000, shopId: 'shop_999' })`

---

## Files Created

1. `/src/lib/api/paymentUrls.js` - URL mappings
2. `/src/hooks/usePaymentDebug.js` - React hook for debugging
3. `/src/lib/api/paymentApiTester.js` - Browser console tester
4. `/docs/PAYMENT_API_DEBUG_GUIDE.md` - Full documentation
