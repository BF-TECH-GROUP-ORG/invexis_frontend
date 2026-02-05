# 💳 Payment API Integration & Console Logging Guide

## Overview

This guide walks you through the payment API structure and how to view formatted data in the browser console.

---

## 📊 Data Structure Being Displayed

### Payment Response Format

The table displays payment data with the following structure:

```json
{
  "sellerId": "seller_456",
  "totalPayments": 25,
  "totalAmount": 1250000,
  "currency": "RWF",
  "payments": [
    {
      "paymentId": "payment_001",
      "amount": 50000,
      "status": "completed",
      "paymentMethod": "stripe",
      "createdAt": "2026-01-22T09:00:00Z"
    }
  ]
}
```

**Fields:**
- `sellerId`: Unique seller identifier
- `totalPayments`: Total count of payment records
- `totalAmount`: Sum of all payments (in smallest currency unit)
- `currency`: Currency code (RWF, USD, etc.)
- `payments`: Array of individual payment records

**Payment Record Fields:**
- `paymentId`: Unique payment identifier
- `amount`: Payment amount (in smallest currency unit)
- `status`: Payment status (completed, pending, failed, cancelled, processing)
- `paymentMethod`: Payment gateway (stripe, mtn, airtel, mpesa, bank_transfer)
- `createdAt`: ISO 8601 timestamp when payment was created

---

## 🎯 Table Features

### Summary Cards
Three summary cards display key metrics:
1. **Total Payments**: Number of payment records
2. **Total Amount**: Sum of all payments with currency
3. **Seller ID**: Unique seller identifier

### Filterable Columns
- **Payment ID**: Unique identifier (searchable)
- **Amount**: Payment amount in currency (right-aligned)
- **Status**: Payment status with color-coded badge
- **Payment Method**: Payment gateway with icon badge
- **Date**: Creation timestamp (formatted)
- **Actions**: View, Download, Delete options

### Search & Filter
- Search by Payment ID, Method, Status, or Amount
- Column visibility toggle
- Pagination (5, 10, 25, 50 items per page)

### Status Colors
| Status | Color | Meaning |
|--------|-------|---------|
| ✅ Completed | Green | Payment successfully processed |
| ⏳ Pending | Orange | Awaiting processing |
| ❌ Failed | Red | Payment could not be processed |
| 🚫 Cancelled | Gray | Payment was cancelled |
| 🔄 Processing | Blue | Payment is being processed |

### Payment Method Icons
- 💳 **Stripe**: Credit/Debit cards
- 📱 **MTN**: MTN MoMo mobile money
- 📞 **Airtel**: Airtel Money mobile money
- 💰 **M-Pesa**: M-Pesa mobile money
- 🏦 **Bank Transfer**: Direct bank transfer

---

## 🖥️ Console Output

When the payments page loads, the console displays:

### 1. Debug Header
```
╔════════════════════════════════════════════════════════════╗
║         PAYMENT API DEBUG MODE - INITIALIZED               ║
╚════════════════════════════════════════════════════════════╝
```

### 2. All 27 Endpoints Mapped

#### Payment Endpoints (6)
1. ✅ Initiate Payment - `POST /api/payments/initiate`
2. ✅ Get Payment Status - `GET /api/payments/status/:payment_id`
3. ✅ Get Seller Payments - `GET /api/payments/seller/:seller_id`
4. ✅ Get Company Payments - `GET /api/payments/company/:company_id`
5. ✅ Get Shop Payments - `GET /api/payments/shop/:shop_id`
6. ✅ Cancel Payment - `POST /api/payments/cancel/:payment_id`

#### Transaction Endpoints (3)
7. ✅ Get Seller Transactions - `GET /api/payments/transactions/seller/:seller_id`
8. ✅ Get Company Transactions - `GET /api/payments/transactions/company/:company_id`
9. ✅ Get Shop Transactions - `GET /api/payments/transactions/shop/:shop_id`

#### Invoice Endpoints (5)
10. ✅ Get Invoice - `GET /api/payments/invoices/:invoice_id`
11. ✅ Get Seller Invoices - `GET /api/payments/invoices/seller/:seller_id`
12. ✅ Get Company Invoices - `GET /api/payments/invoices/company/:company_id`
13. ✅ Get Shop Invoices - `GET /api/payments/invoices/shop/:shop_id`
14. ✅ Download Invoice PDF - `GET /api/payments/invoices/:invoice_id/pdf`

#### Reporting & Analytics Endpoints (13)
15. ✅ Platform Overview - `GET /api/payments/reports/platform/overview`
16. ✅ Platform Top Companies - `GET /api/payments/reports/platform/top-companies`
17. ✅ Dashboard Charts - `GET /api/payments/reports/charts/dashboard`
18. ✅ Seller Monthly Totals - `GET /api/payments/reports/seller/:seller_id/monthly`
19. ✅ Revenue Summary - `GET /api/payments/reports/revenue-summary`
20. ✅ Payment Statistics - `GET /api/payments/reports/stats`
21. ✅ Gateway Performance - `GET /api/payments/reports/gateway-performance`
22. ✅ Payment Trends - `GET /api/payments/reports/trends`
23. ✅ Export Transactions - `GET /api/payments/reports/export/transactions`
24. ✅ Shop Analytics - `GET /api/payments/reports/shop/:shop_id/analytics`
25. ✅ Company Analytics - `GET /api/payments/reports/company/:company_id/analytics`
26. ✅ Top Products - `GET /api/payments/reports/top-products`
27. ✅ Payout History - `GET /api/payments/reports/payouts`

### 3. Sample Payment Data
```
╔══ SAMPLE PAYMENT DATA ════════════════════════════════════╗
This is the data structure being mapped in the table below:
```

Complete payment response object is logged with:
- Full payment structure
- Summary table with key metrics
- Individual payment details table
- Payment methods breakdown
- Payment status breakdown

### 4. Ready Message
```
╔═══════════════════════════════════════════════════════════╗
║  ✅ Ready to integrate actual API calls                   ║
║  💡 Open browser console to see all endpoints mapped      ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 Console Methods

The console logger provides these methods:

### Payment Data Logging
```javascript
// Log payment summary with breakdown
paymentAPILogger.logPaymentSummary(paymentData);
```

### Transaction Data Logging
```javascript
// Log transaction summary
paymentAPILogger.logTransactionSummary(transactionData);
```

### Invoice Data Logging
```javascript
// Log invoice summary
paymentAPILogger.logInvoiceSummary(invoiceData);
```

### Report Data Logging
```javascript
// Log any report data
paymentAPILogger.logReportingData('Gateway Performance', reportData);
```

### Error Logging
```javascript
// Log API errors
paymentAPILogger.logError('getSellerPayments', error);
```

### Statistics
```javascript
// View API call statistics
paymentAPILogger.logStatistics();
```

### Reset
```javascript
// Reset all counters
paymentAPILogger.reset();
```

---

## 🔍 How to View Data in Console

1. **Open Browser Console** 
   - Chrome/Firefox: Press `F12` or `Ctrl+Shift+I`
   - macOS: Press `Cmd+Option+I`

2. **Look for Colored Headers**
   - Each section is color-coded for easy identification
   - 🟢 Green headers = Initialization/Success
   - 🟠 Orange headers = Warnings/Caution
   - 🔵 Blue headers = Information
   - 🟣 Purple headers = Reporting data

3. **Expand Tables**
   - Click on table objects to expand and view properties
   - Look for the nested arrays in payment records

4. **Search Logs**
   - Use console search (Ctrl+F in DevTools)
   - Search for: "PAYMENT", "TRANSACTION", "INVOICE", "REPORT"

---

## 📊 Data Format Examples

### Single Payment Response
```javascript
{
  paymentId: "payment_001",
  amount: 50000,
  status: "completed",
  paymentMethod: "stripe",
  createdAt: "2026-01-22T09:00:00Z"
}
```

### Seller Payments Response
```javascript
{
  sellerId: "seller_456",
  totalPayments: 25,
  totalAmount: 1250000,
  currency: "RWF",
  payments: [/* array of payment objects */]
}
```

### Platform Overview Response
```javascript
{
  totalRevenue: 50000000,
  totalTransactions: 2000,
  totalCompanies: 50,
  totalSellers: 500,
  activePaymentMethods: 4,
  pendingPayments: 15,
  failedPayments: 5
}
```

---

## 🚀 Next Steps

### To Integrate Real API Calls:

1. **Update Cards Data** - Replace sample data with API calls
```javascript
const [paymentData, setPaymentData] = useState(null);
useEffect(() => {
  // Fetch from /api/payments/seller/:seller_id
  fetch(`/api/payments/seller/${sellerId}`)
    .then(res => res.json())
    .then(data => {
      setPaymentData(data);
      logPaymentAPI.payment(data);  // Log to console
    });
}, []);
```

2. **Update Summary Cards** - Derive data from API responses
```javascript
const cardsData = [
  {
    title: "Daily Payments",
    cardvalue: paymentData?.totalAmount || 0,
    ...
  },
  ...
];
```

3. **Handle Pagination** - Implement server-side pagination
```javascript
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

// Fetch with pagination params
fetch(`/api/payments/seller/${sellerId}?page=${page}&limit=${rowsPerPage}`)
```

4. **Add Loading States** - Show skeletons while loading
```javascript
<PaymentTable data={paymentData} isLoading={isLoading} />
```

5. **Implement Error Handling** - Show error messages
```javascript
.catch(error => {
  logPaymentAPI.error('getSellerPayments', error);
  showErrorNotification(error.message);
});
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All amounts are in the smallest currency unit (cents for USD, etc.)
- The sample data includes 8 payments with different statuses and methods
- Payment methods are color-coded for quick visual identification
- Status badges automatically update based on the payment status value

---

## ✅ Checklist

- [x] Payment table component created
- [x] All 27 API endpoints documented
- [x] Console logging implemented
- [x] Sample data structure defined
- [x] Table features working (search, filter, pagination)
- [x] Status and method badges styled
- [ ] Connect to real API endpoints
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add success/error notifications

