# Payment API Debugging System - Setup Complete ✅

## What Was Created

You now have a complete **console-based debugging system** for testing payment API endpoints without making actual calls. This lets you see exactly how the data is formatted before integration.

---

## 📁 Files Created

### 1. **Core Files**
- `/src/lib/api/paymentUrls.js` - Complete mapping of all 50+ payment endpoints
- `/src/hooks/usePaymentDebug.js` - React hook for component integration
- `/src/lib/api/paymentApiTester.js` - Browser console tester utility

### 2. **Updated Files**
- `/src/app/[locale]/inventory/payments/page.jsx` - Now initializes tester
- `/src/app/[locale]/inventory/payments/cards.jsx` - Now logs endpoints on mount

### 3. **Documentation**
- `/docs/PAYMENT_API_DEBUG_GUIDE.md` - Full technical guide
- `/docs/PAYMENT_API_QUICK_REFERENCE.md` - Quick reference for console commands

---

## 🚀 Quick Start (30 seconds)

### 1. Open the payments page
Navigate to: `http://localhost:3000/[locale]/inventory/payments`

### 2. Open browser console
Press: `F12` → Click "Console" tab

### 3. Try these commands:
```javascript
// See all endpoints
paymentTester.listEndpoints()

// See details about a specific endpoint
paymentTester.endpoint('getSellerPayments')

// See expected data format
paymentTester.test('getSellerPayments')

// Generate CURL command for terminal testing
paymentTester.curl('getSellerPayments', 'seller_456')

// Make actual API call (when backend ready)
await paymentTester.fetch('getSellerPayments', 'seller_456')
```

---

## 📊 For Your Payment Cards

### Card 1: "Daily Payments"
```javascript
// Find this in console:
paymentTester.endpoint('getSellerPayments')

// Expected data value:
response.totalAmount  // e.g., 1250000

// API Endpoint:
GET /api/payments/seller/{seller_id}
```

### Card 2: "Daily Transactions"
```javascript
// Find this in console:
paymentTester.endpoint('getSellerTransactions')

// Expected data value:
response.totalTransactions  // e.g., 30

// API Endpoint:
GET /api/payments/transactions/seller/{seller_id}
```

### Card 3: "Most Used Method"
```javascript
// Find this in console:
paymentTester.endpoint('dashboardCharts')

// Expected data value:
// Find method with highest percentage in paymentMethodBreakdown
response.paymentMethodBreakdown[0].method  // e.g., 'stripe'

// API Endpoint:
GET /api/payments/reports/charts/dashboard
```

---

## 🔍 Available Endpoints

The system maps all these endpoint categories:

- ✅ **Payment Routes** (5) - initiate, status, cancel, etc.
- ✅ **Payment Queries** (3) - seller/company/shop payments
- ✅ **Transactions** (3) - seller/company/shop transactions
- ✅ **Reports** (10) - analytics, charts, trends, etc.
- ✅ **Invoices** (5) - get, list, download PDF
- ✅ **Webhooks** (4) - Stripe, MTN, Airtel, M-Pesa
- ✅ **Platform Stats** (2) - overview, top companies

**Total: 50+ endpoints documented with sample data**

---

## 💡 How It Works

1. **No Backend Calls Yet** - All console output is from the mapping file
2. **Mock Data Available** - Each endpoint has sample response structure
3. **URL Generation** - Dynamic IDs (seller_id, shop_id, etc.) are substituted
4. **Ready for Integration** - Once backend is ready, use `paymentTester.fetch()`

---

## 📝 Console Methods

| Command | Purpose |
|---------|---------|
| `paymentTester.help()` | Show all available commands |
| `paymentTester.listEndpoints()` | List all endpoints |
| `paymentTester.endpoint(name)` | Get endpoint details |
| `paymentTester.test(endpoint)` | Test with mock data |
| `paymentTester.fetch(endpoint)` | Make actual API call |
| `paymentTester.curl(endpoint)` | Generate CURL command |
| `paymentTester.compare(endpoint, data)` | Compare expected vs actual |
| `paymentTester.url(endpoint, id)` | Get URL for endpoint |

---

## 🔗 Integration Pattern

### Before (Just Mock Data)
```javascript
const [dailyPayments, setDailyPayments] = useState(20000);

return <PaymentCard value={dailyPayments} />;
```

### After (With Real Data)
```javascript
const [dailyPayments, setDailyPayments] = useState(null);

useEffect(() => {
  const fetchPayments = async () => {
    // Use the tester to understand the response first
    const data = await paymentTester.fetch('getSellerPayments', sellerId);
    setDailyPayments(data.totalAmount);
  };
  
  fetchPayments();
}, []);

return <PaymentCard value={dailyPayments} />;
```

---

## ⚙️ Configuration

### Set your API URL in `.env.local`:
```
NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:5000/api/payments
```

### Or for production:
```
NEXT_PUBLIC_PAYMENT_API_URL=https://api.production.com/api/payments
```

---

## 📚 Documentation

- **Full Guide**: `/docs/PAYMENT_API_DEBUG_GUIDE.md`
- **Quick Ref**: `/docs/PAYMENT_API_QUICK_REFERENCE.md`
- **Source**: See file comments in source code

---

## ✨ Features

✅ **Zero Dependencies** - No extra npm packages needed  
✅ **Type Safe** - Clear object structures for all endpoints  
✅ **Console Friendly** - Formatted console output with colors  
✅ **CURL Generation** - Easily test in terminal/Postman  
✅ **Fetch Ready** - Built-in fetch wrapper with auth headers  
✅ **Auto-Global** - Available as `window.paymentTester` everywhere  
✅ **Documented** - Every endpoint has description & sample data  

---

## 🎯 Next Steps

1. **Today**: Explore endpoints in console
   ```javascript
   paymentTester.listEndpoints()
   ```

2. **Map Your Cards**: Understand data format
   ```javascript
   paymentTester.endpoint('getSellerPayments')
   paymentTester.endpoint('getSellerTransactions')
   paymentTester.endpoint('dashboardCharts')
   ```

3. **Create React Hooks**: Once backend is ready
   ```javascript
   // Soon: src/hooks/usePayments.js
   const { payments, loading, error } = usePayments(sellerId);
   ```

4. **Update Components**: Replace mock with real data
   ```javascript
   <PaymentCard value={payments?.totalAmount} />
   ```

---

## 🆘 Need Help?

### Show all commands:
```javascript
paymentTester.help()
```

### Explore an endpoint:
```javascript
paymentTester.endpoint('YOUR_ENDPOINT_NAME')
```

### See what data structure to expect:
```javascript
paymentTester.test('YOUR_ENDPOINT_NAME')
```

### Check console logs in cards.jsx:
- Open DevTools
- Go to Console tab
- Reload page
- You'll see formatted output of all available endpoints

---

## 🎓 Example Session

```javascript
// 1. See all available routes
paymentTester.listEndpoints()

// 2. Check what daily payments endpoint expects
paymentTester.endpoint('getSellerPayments')
// Output: Shows URL pattern, method, expected response

// 3. Mock a call to understand data
paymentTester.test('getSellerPayments')
// Output: Shows request/response structure

// 4. Generate CURL for your specific seller
paymentTester.curl('getSellerPayments', 'your_seller_id')
// Output: CURL command you can run in terminal

// 5. When backend is ready, make real call
const data = await paymentTester.fetch('getSellerPayments', 'your_seller_id')
// Output: Actual API response

// 6. Compare with expected structure
paymentTester.compare('getSellerPayments', data)
// Output: Highlights any differences
```

---

**Status**: ✅ Ready to Debug!  
**Start**: Open payments page → Press F12 → Type in console

Happy debugging! 🎉
