<!-- PAYMENT API DEBUGGING SYSTEM - ARCHITECTURE -->

# Payment API Debugging System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER / DEVELOPER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           CONSOLE (Browser DevTools - F12)              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ paymentTester.listEndpoints()                           │   │
│  │ paymentTester.endpoint('getSellerPayments')             │   │
│  │ paymentTester.test('initiatePayment')                   │   │
│  │ paymentTester.fetch('getSellerPayments', 'seller_456')  │   │
│  │ paymentTester.curl('initiatePayment')                   │   │
│  │ paymentTester.compare('endpoint', actualData)           │   │
│  └────────────────┬────────────────────────────────────────┘   │
│                   │                                              │
│              Uses (imports)                                      │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Global Object: window.paymentTester                   │   │
│  │                 (from paymentApiTester.js)              │   │
│  └────────────────┬────────────────────────────────────────┘   │
│                   │                                              │
│              Accesses                                            │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │  PAYMENT URLS MAPPING      │
        ├───────────────────────────┤
        │ paymentUrls.js            │
        │                           │
        │ PAYMENT_URLS Object       │
        │ {                         │
        │  getSellerPayments: {...} │
        │  initiatePayment: {...}   │
        │  dashboardCharts: {...}   │
        │  ... 50+ endpoints        │
        │ }                         │
        └───────────────────────────┘
```

---

## Component Hierarchy

```
PaymentsPage (/src/app/[locale]/inventory/payments/page.jsx)
    ├── imports: paymentApiTester.js (initializes window.paymentTester)
    ├── imports: PaymentCard
    └── useEffect: Logs console instructions
         │
         └─► Calls usePaymentDebug hook methods
             (But not required - console commands work directly)

PaymentCard (/src/app/[locale]/inventory/payments/cards.jsx)
    ├── imports: usePaymentDebug hook
    └── useEffect: 
         ├── logEndpointsSummary()
         ├── inspectEndpoint('getSellerPayments')
         ├── inspectEndpoint('dashboardCharts')
         └── mockApiCall('initiatePayment')
         
         All logs appear in browser console
```

---

## Data Flow: How It Works

### When Page Loads:
```
1. Next.js loads PaymentsPage component
2. paymentApiTester.js runs immediately
   ├─ Creates window.paymentTester object
   └─ Logs: "✅ Payment API Tester loaded!"

3. PaymentCard component mounts
   └─ usePaymentDebug hook executes
      ├─ Logs all endpoints summary
      ├─ Logs example endpoint details
      └─ Shows mock API call

4. Browser Console now shows:
   ├─ 🔗 Payment API Routes
   ├─ 📋 Endpoint Summary
   ├─ 🔍 Sample Inspections
   └─ 🎭 Mock API Call
```

---

## Console Commands: Which File Handles What

```javascript
// ┌─ paymentApiTester.js
// │
paymentTester.listEndpoints()
↓ Creates formatted output of PAYMENT_URLS

paymentTester.endpoint('name')
↓ Looks up in PAYMENT_URLS, displays details

paymentTester.test('endpoint', customData)
↓ Shows request/response structure from PAYMENT_URLS

paymentTester.curl('endpoint', id)
↓ Builds CURL string from PAYMENT_URLS data

paymentTester.fetch('endpoint', id, customData)
↓ Makes actual fetch call (when backend ready)
  ├─ Uses URL from PAYMENT_URLS
  ├─ Uses payload from PAYMENT_URLS
  └─ Returns actual API response

paymentTester.compare('endpoint', actualData)
↓ Compares actualData against expected in PAYMENT_URLS
```

---

## Three Layers of Interaction

### Layer 1: Just View (Passive)
```javascript
// Just browse in console
paymentTester.listEndpoints()
paymentTester.endpoint('getSellerPayments')
// No API calls made, just viewing mapped data
```

### Layer 2: Test with Mock Data (Simulation)
```javascript
// See what request/response would look like
paymentTester.test('getSellerPayments')
paymentTester.curl('getSellerPayments', 'seller_456')
// Still no actual API calls, just showing structure
```

### Layer 3: Actual API Calls (When Backend Ready)
```javascript
// Make real API requests
const data = await paymentTester.fetch('getSellerPayments', 'seller_456')
// Now talking to actual backend
```

---

## File Dependencies

```
page.jsx (PaymentsPage)
    └── paymentApiTester.js ◄───────────────────┐
            └── Creates: window.paymentTester     │
                                                  │
cards.jsx (PaymentCard)                          │
    └── usePaymentDebug.js ◄──────────────────┐  │
            └── Uses: PAYMENT_URLS             │  │
                │                              │  │
                └─ paymentUrls.js ◄───────────┼──┤
                        └── Source of truth:   │  │
                            All endpoint URLs  │  │
                            Sample data        │  │
                            Expected responses │  │
                                               │  │
Both also use:                                 │  │
    └─ paymentApiTester.js ◄─────────────────┘  │
            └── Makes it global for console      │
                (window.paymentTester)            │
                                                  │
Exposes globally:                                 │
    └── window.paymentTester ◄───────────────────┘
            └── Available everywhere in app
```

---

## Data Structure Example: getSellerPayments

```
PAYMENT_URLS.getSellerPayments
    │
    ├── url: (sellerId) => `${BASE_URL}/seller/${sellerId}`
    │       // Function because it needs dynamic ID
    │
    ├── method: 'GET'
    │
    ├── description: 'Get all payments for a specific seller'
    │
    ├── sampleUrl: 'http://localhost:5000/api/payments/seller/seller_456'
    │
    └── expectedResponse: {
            sellerId: 'seller_456',
            totalPayments: 25,
            totalAmount: 1250000,  ◄─── YOUR CARD VALUE
            currency: 'RWF',
            payments: [ {...}, {...} ]
        }

In Browser Console:
    paymentTester.endpoint('getSellerPayments')
    
Outputs:
    Description: Get all payments for a specific seller
    Method: GET
    URL Pattern: /api/payments/seller/YOUR_ID
    Sample URL: /api/payments/seller/seller_456
    Expected Response: { ... }
```

---

## Payment Cards Mapping

```
┌─────────────────────────────────────────────────────┐
│              PAYMENT CARDS UI                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Daily        │  │ Daily        │  │ Most     │  │
│  │ Payments     │  │ Transactions │  │ Used     │  │
│  │ 1,250,000    │  │ 30           │  │ stripe   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│        ▲                  ▲                  ▲       │
│        │                  │                  │       │
│   data from:         data from:         data from:  │
│   getSellerPayments  getSellerTransact. dashboardCh.│
│   .totalAmount       .totalTransactions .method     │
│                                                      │
└─────────────────────────────────────────────────────┘
        ▲
        │
    To Test:
    paymentTester.endpoint('getSellerPayments')
    paymentTester.endpoint('getSellerTransactions')
    paymentTester.endpoint('dashboardCharts')
```

---

## Integration Timeline

### Phase 1: NOW ✅ CURRENT STATE
```
Stage: Understanding & Debugging
├─ Console: See all URLs & sample data
├─ No Backend: Just mapped endpoints
└─ Next: Understand response structures
```

### Phase 2: SOON (When Backend Ready)
```
Stage: Real API Calls
├─ Console: Use paymentTester.fetch()
├─ Backend: Backend API must be running
└─ Next: Create React hooks with real data
```

### Phase 3: LATER
```
Stage: Production Ready
├─ Components: Use custom hooks instead of console
├─ States: Loading, error, success
└─ Cache: Possibly add SWR/React Query
```

---

## Quick Debug Checklist

```
✅ paymentTester available?
   → Type: paymentTester in console
   → Should show: Object { ... }

✅ Can see all endpoints?
   → paymentTester.listEndpoints()
   → Should show: 50+ endpoints organized

✅ Can see endpoint details?
   → paymentTester.endpoint('getSellerPayments')
   → Should show: URL, method, expected response

✅ Can mock API call?
   → paymentTester.test('initiatePayment')
   → Should show: Request structure

✅ Can generate CURL?
   → paymentTester.curl('getSellerPayments', 'seller_456')
   → Should show: CURL command (copyable)

✅ Cards showing on page?
   → Should see: Three cards with mock data
   → Console should show: Endpoint inspections

✅ Ready to call real API?
   → await paymentTester.fetch('getSellerPayments', 'seller_456')
   → Should return: Actual backend response
```

---

## Key Points

1. **PAYMENT_URLS** is the source of truth
2. **paymentTester** exposes PAYMENT_URLS in browser console
3. **usePaymentDebug** exposes it in React components
4. **All three work independently** - you don't need all of them
5. **No Backend Required** - Console works without backend
6. **When Backend Ready** - Just swap mock calls for real fetch calls
7. **Data Format Known** - See expected response structure first

---

## Visual: Request → Response Cycle

```
Browser Console Command
    │
    ▼
paymentTester.fetch('endpoint', id, customData)
    │
    ├─ Looks up endpoint in PAYMENT_URLS
    ├─ Gets: URL, method, sample data
    ├─ Constructs: fetch request
    └─ Adds: auth headers from localStorage
         │
         ▼
    HTTP Request
    GET http://localhost:5000/api/payments/seller/seller_456
    Headers: {
      Authorization: Bearer {token},
      Content-Type: application/json
    }
         │
         ▼
    Backend API
    (Node.js Express server)
         │
         ▼
    HTTP Response
    {
      sellerId: "seller_456",
      totalAmount: 1250000,
      ...
    }
         │
         ▼
    Console Output
    ✅ Status: 200
    ✅ Response: { ... }
         │
         ▼
    Use in Component
    setDailyPayments(response.totalAmount)
```

---

End of Architecture Documentation
