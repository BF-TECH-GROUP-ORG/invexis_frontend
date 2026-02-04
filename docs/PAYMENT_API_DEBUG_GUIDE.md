// PAYMENT API DEBUGGING GUIDE

## Overview
This guide explains how the payment API endpoints are mapped and debugged before making actual API calls.

## Files Created

### 1. `/src/lib/api/paymentUrls.js`
**Purpose**: Central mapping of all payment API endpoints with metadata

**Key Features**:
- Complete URL structure for all payment routes
- Sample request/response data for each endpoint
- Expected data format documentation
- Helper functions for logging

**Main Export**: `PAYMENT_URLS` object containing:
- Payment routes (initiate, status, cancel)
- Seller/Company/Shop payment queries
- Transaction routes
- Reporting and analytics routes
- Invoice management routes
- Webhook configurations

**Helper Functions**:
- `logPaymentUrls()` - Log all available URLs
- `logPaymentRoute(routeName)` - Log specific route details
- `logReportsRoutes()` - Log all reporting endpoints

### 2. `/src/hooks/usePaymentDebug.js`
**Purpose**: React hook for debugging payment API calls in components

**Available Methods**:

#### `inspectEndpoint(endpoint, id)`
Logs detailed information about a specific endpoint
```javascript
const { inspectEndpoint } = usePaymentDebug();
inspectEndpoint('getSellerPayments', 'seller_456');
// Outputs: Configuration, sample payload, expected response
```

#### `inspectCategory(category)`
Logs all endpoints in a category
```javascript
inspectCategory('reports');
// Outputs: All reporting endpoints
```

#### `mockApiCall(endpoint, id, payload)`
Simulates an API call without actually making it
```javascript
mockApiCall('initiatePayment', null, { amount: 50000, currency: 'RWF' });
// Outputs: Request details and expected response structure
```

#### `getEndpointUrl(endpoint, id)`
Returns the actual URL for an endpoint
```javascript
const url = getEndpointUrl('getSellerPayments', 'seller_123');
// Returns: "http://localhost:5000/api/payments/seller/seller_123"
```

#### `logEndpointsSummary()`
Logs a summary of all endpoints grouped by type
```javascript
logEndpointsSummary();
// Outputs: Organized view of all payment endpoints
```

### 3. Updated `/src/app/[locale]/inventory/payments/cards.jsx`
**Changes**:
- Added `'use client'` directive
- Imported `usePaymentDebug` hook
- Added `useEffect` to log all endpoints on mount
- Formatted code for readability

## How to Use

### In Your Components

```javascript
'use client';

import usePaymentDebug from "@/hooks/usePaymentDebug";
import { useEffect } from "react";

export default function YourComponent() {
    const { inspectEndpoint, mockApiCall, getEndpointUrl } = usePaymentDebug();

    useEffect(() => {
        // Inspect endpoint before making actual call
        inspectEndpoint('getSellerPayments', 'seller_456');

        // Mock the API call to see the structure
        const mockData = mockApiCall('getSellerPayments', 'seller_456');
        
        // Get the actual URL when ready to make the real call
        const realUrl = getEndpointUrl('getSellerPayments', 'seller_456');
        console.log('Ready to call:', realUrl);
    }, [inspectEndpoint, mockApiCall, getEndpointUrl]);

    return <div>Your JSX here</div>;
}
```

### Console Output Example

When you load the payments page, you'll see structured logs like:

```
=== PAYMENT API DEBUG MODE ===

📋 Payment Endpoints Summary
├── 📌 Payment Management
│   ├── initiatePayment: http://localhost:5000/api/payments/initiate
│   ├── getPaymentStatus: http://localhost:5000/api/payments/status/{id}
│   └── cancelPayment: http://localhost:5000/api/payments/cancel/{id}
├── 📌 Payment Queries
│   ├── getSellerPayments: http://localhost:5000/api/payments/seller/{id}
│   ├── getCompanyPayments: http://localhost:5000/api/payments/company/{id}
│   └── getShopPayments: http://localhost:5000/api/payments/shop/{id}
└── ...more categories

🔍 Inspecting Endpoint: getSellerPayments
📌 Configuration:
{
  description: 'Get all payments for a specific seller',
  method: 'GET',
  url: 'http://localhost:5000/api/payments/seller/seller_456'
}
📤 Expected Response Structure:
{
  sellerId: 'seller_456',
  totalPayments: 25,
  totalAmount: 1250000,
  payments: [ { ... } ]
}
```

## Payment Endpoints Quick Reference

### Daily Payments
```javascript
inspectEndpoint('getSellerPayments', 'seller_id');
// GET /api/payments/seller/{seller_id}
```

### Daily Transactions
```javascript
inspectEndpoint('getSellerTransactions', 'seller_id');
// GET /api/payments/transactions/seller/{seller_id}
```

### Most Used Payment Method
```javascript
inspectCategory('reports');
// Check: reports.dashboardCharts
// GET /api/payments/reports/charts/dashboard
// Response includes: paymentMethodBreakdown
```

### Dashboard Overview
```javascript
inspectEndpoint('reports.platformOverview');
// GET /api/payments/reports/platform/overview
```

## Next Steps (After Debugging)

Once you understand the data structures:

1. **Create API Service** (`src/lib/api/paymentService.js`)
   - Implement actual fetch/axios calls
   - Use the URLs from PAYMENT_URLS

2. **Create Data Hooks** (`src/hooks/usePayments.js`)
   - useGetSellerPayments(sellerId)
   - useGetPaymentStats()
   - etc.

3. **Update Components**
   - Replace mock data with real API calls
   - Use loading/error states

4. **Handle Real Data**
   - Format response data as needed
   - Update card values dynamically

## Environment Variables

Make sure to set in `.env.local`:

```env
NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:5000/api/payments
```

Or for production:
```env
NEXT_PUBLIC_PAYMENT_API_URL=https://api.production.com/api/payments
```

## Troubleshooting

### URLs not showing?
- Check console for errors
- Verify `PAYMENT_URLS` is properly imported
- Ensure component has `'use client'` directive

### Mock data different than expected?
- Check the `PAYMENT_URLS` structure
- Verify endpoint name matches (case-sensitive)
- Use `inspectEndpoint()` to see exact expected format

### Need to add new endpoints?
1. Add to `PAYMENT_URLS` in `/src/lib/api/paymentUrls.js`
2. Include: `url`, `method`, `description`, `expectedResponse`
3. The debug hook will automatically recognize it
