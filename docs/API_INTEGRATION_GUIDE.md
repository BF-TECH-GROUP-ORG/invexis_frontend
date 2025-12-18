# API Integration Guide for Team

## 🎯 Quick Start: Adding a New API in 5 Steps

This guide shows you how to integrate a new backend API into our Next.js project using our global framework.

**Time Estimate**: 10 minutes per new service

---

## Prerequisites

Before you start, make sure you have:

- ✅ Your backend API endpoint URL
- ✅ API documentation (request/response structure)
- ✅ Knowledge of whether the data is static, semi-dynamic, or real-time
- ✅ Access to `src/services/` folder

---

## Step 1: Determine Caching Strategy

Use this decision tree to determine the correct caching for your API:

```
START: What type of data does this API return?

├─ User/Notifications/Live Status?
│  └─ ✅ Use: cache: "no-store" (always real-time)
│
├─ Real-time stock levels/active orders/current prices?
│  └─ ✅ Use: cache: "no-store" (always real-time)
│
├─ Historical data that rarely changes?
│  ├─ Changes once a day? → revalidate: 86400 (24 hours)
│  ├─ Changes hourly? → revalidate: 3600 (1 hour)
│  └─ Changes every few minutes? → revalidate: 300 (5 minutes)
│
└─ Static reference data (categories, countries, etc.)?
   └─ ✅ Use: revalidate: 86400 (24 hours)
```

### Caching Blueprint Reference

| Module Type         | Revalidate Time | Example APIs              |
| ------------------- | --------------- | ------------------------- |
| Analytics widgets   | 60-300s         | Dashboard stats           |
| Staff/Shops         | 3600s (1 hour)  | Employee list, store list |
| Inventory metadata  | 3600s           | Product names, SKUs       |
| **Inventory stock** | **no-store**    | Current stock levels      |
| Sales historical    | 300s (5 min)    | Past transactions         |
| **Sales active**    | **no-store**    | Current/pending sales     |
| Categories/Docs     | 86400s (24 hr)  | Product categories        |
| **Notifications**   | **no-store**    | User notifications        |

---

## Step 2: Create Your Service File

### Template: Standard Service (GET/POST/PUT/DELETE)

Create a new file: `src/services/yourModuleService.js`

```javascript
// src/services/paymentService.js (example)

import apiClient from "@/lib/apiClient";
import { CACHE_DURATIONS } from "@/lib/cacheConfig";
import { revalidatePath } from "next/cache";

const API_PATH = "/payments/v1"; // Your API base path

/**
 * Get all payments (use caching per blueprint)
 * @param {Object} params - Query parameters
 * @returns {Promise} Payment data
 */
export async function getPayments({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append("status", status);

  return apiClient(`${API_PATH}?${params}`, {
    // STEP 1 DECISION: Choose based on your data type
    revalidate: CACHE_DURATIONS.PAYMENTS_HISTORICAL, // For historical data
    // OR
    // cache: 'no-store', // For real-time data

    method: "GET",
  });
}

/**
 * Get single payment by ID (real-time data)
 * @param {string} id - Payment ID
 * @returns {Promise} Payment details
 */
export async function getPaymentById(id) {
  return apiClient(`${API_PATH}/${id}`, {
    cache: "no-store", // Real-time for individual items
    method: "GET",
  });
}

/**
 * Create new payment (mutations never cached)
 * @param {Object} paymentData - Payment payload
 * @returns {Promise} Created payment
 */
export async function createPayment(paymentData) {
  const result = await apiClient(`${API_PATH}`, {
    method: "POST",
    body: paymentData,
    cache: "no-store", // Mutations always no-store
  });

  // IMPORTANT: Trigger revalidation after mutation
  if (typeof window === "undefined") {
    revalidatePath("/dashboard/payments"); // Update path to your page
  }

  return result;
}

/**
 * Update payment
 * @param {string} id - Payment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} Updated payment
 */
export async function updatePayment(id, updates) {
  const result = await apiClient(`${API_PATH}/${id}`, {
    method: "PUT",
    body: updates,
    cache: "no-store",
  });

  // Revalidate after update
  if (typeof window === "undefined") {
    revalidatePath("/dashboard/payments");
    revalidatePath(`/dashboard/payments/${id}`);
  }

  return result;
}

/**
 * Delete payment
 * @param {string} id - Payment ID
 * @returns {Promise} Deletion result
 */
export async function deletePayment(id) {
  const result = await apiClient(`${API_PATH}/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  // Revalidate after deletion
  if (typeof window === "undefined") {
    revalidatePath("/dashboard/payments");
  }

  return result;
}

// Export all functions
export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
```

---

## Step 3: Add Cache Duration (If Needed)

If you're using a cache duration that doesn't exist yet, add it to the config:

### File: `src/lib/cacheConfig.js`

```javascript
export const CACHE_DURATIONS = {
  // ... existing durations ...

  // ADD YOUR NEW MODULE HERE
  PAYMENTS_HISTORICAL: 300, // 5 minutes
  BILLING_STATUS: 60, // 1 minute

  // Use descriptive names: MODULE_PURPOSE
};
```

---

## Step 4: Use Your Service in Components

### Option A: Server Component (Recommended)

```javascript
// app/[locale]/payments/page.jsx

import { getPayments } from "@/services/paymentService";

export default async function PaymentsPage({ searchParams }) {
  // Fetch happens server-side with automatic caching
  const payments = await getPayments({
    page: searchParams.page || 1,
    limit: 20,
  });

  return (
    <div>
      <h1>Payments</h1>
      <PaymentsList payments={payments} />
    </div>
  );
}
```

**Benefits**:

- ✅ No useEffect needed
- ✅ No fetch loops possible
- ✅ Automatic caching
- ✅ Faster initial load

### Option B: Client Component (If Interactive Features Needed)

```javascript
// components/PaymentsDashboard.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPayments } from "@/services/paymentService";

export default function PaymentsDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // CRITICAL: Use useCallback to prevent infinite loops
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPayments({ page: 1, limit: 20 });
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array if no dynamic params

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]); // Stable reference prevents loops

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payments</h1>
      {/* Render payments */}
    </div>
  );
}
```

---

## Step 5: Handle Mutations & Revalidation

After creating/updating/deleting data, you MUST trigger cache revalidation:

### Server Actions (Recommended)

```javascript
// app/actions/payments.js
"use server";

import { createPayment } from "@/services/paymentService";
import { revalidatePath } from "next/cache";

export async function createPaymentAction(formData) {
  try {
    const paymentData = {
      amount: formData.get("amount"),
      method: formData.get("method"),
      // ... other fields
    };

    const result = await createPayment(paymentData);

    // CRITICAL: Revalidate to refresh cached data
    revalidatePath("/dashboard/payments");

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Client-Side (Using Router)

```javascript
"use client";

import { useRouter } from "next/navigation";
import { createPayment } from "@/services/paymentService";

export default function CreatePaymentForm() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const paymentData = Object.fromEntries(formData);

    try {
      await createPayment(paymentData);

      // Trigger revalidation by refreshing
      router.refresh();

      // Optionally navigate to list
      router.push("/dashboard/payments");
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

---

## Common Patterns

### Pattern 1: Split Static and Real-Time Data

For modules like **Inventory** where you have both static and real-time data:

```javascript
// productsService.js

/**
 * Get product metadata (CACHED - names, SKUs don't change often)
 */
export async function getProductMetadata(productId) {
  return apiClient(`/products/${productId}/metadata`, {
    revalidate: CACHE_DURATIONS.INVENTORY_METADATA, // 1 hour
  });
}

/**
 * Get product stock (REAL-TIME - changes frequently)
 */
export async function getProductStock(productId) {
  return apiClient(`/products/${productId}/stock`, {
    cache: "no-store", // Always fresh
  });
}

/**
 * Merge both in component
 */
export async function getFullProduct(productId) {
  const [metadata, stock] = await Promise.all([
    getProductMetadata(productId),
    getProductStock(productId),
  ]);

  return {
    ...metadata,
    currentStock: stock.quantity,
  };
}
```

### Pattern 2: Pagination with Caching

```javascript
export async function getPaginatedData({ page, limit, ...filters }) {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters, // Include all filters in URL for proper caching
  });

  return apiClient(`/data?${params}`, {
    revalidate: 300, // Cache each page combo separately
  });
}
```

### Pattern 3: Search/Filter (No Caching)

```javascript
/**
 * Search is user-specific and dynamic - don't cache
 */
export async function searchProducts(query) {
  return apiClient(`/products/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store", // Search results shouldn't be cached
  });
}
```

---

## Troubleshooting

### Problem: Data is Stale

**Symptom**: After creating/updating, old data still shows

**Solution**: Add `revalidatePath()` after mutations

```javascript
if (typeof window === "undefined") {
  revalidatePath("/your-page-path");
}
```

### Problem: Infinite Fetch Loop

**Symptom**: Network tab shows continuous requests

**Solutions**:

1. ✅ Use Server Components (no useEffect needed)
2. ✅ Wrap fetch function in `useCallback` with correct dependencies
3. ✅ Don't include service functions in useEffect dependencies

❌ **BAD**:

```javascript
useEffect(() => {
  getProducts(); // getProducts recreated every render!
}, [getProducts]);
```

✅ **GOOD**:

```javascript
const fetchData = useCallback(async () => {
  await getProducts();
}, []); // Stable reference

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Problem: Cache Not Working

**Check**:

1. Are you using `cache` or `revalidate` option?
2. Is endpoint in `NO_STORE_ENDPOINTS` list? (check `cacheConfig.js`)
3. Are you calling from Server Component (caching works best server-side)?

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ API Integration Cheat Sheet                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. Create service file: src/services/yourService.js        │
│                                                              │
│ 2. Import utilities:                                        │
│    import apiClient from '@/lib/apiClient';                 │
│    import { CACHE_DURATIONS } from '@/lib/cacheConfig';     │
│                                                              │
│ 3. Choose caching:                                          │
│    Real-time?      → cache: 'no-store'                      │
│    Static?         → revalidate: 86400                      │
│    Semi-dynamic?   → revalidate: 300-3600                   │
│                                                              │
│ 4. Mutations ALWAYS:                                        │
│    - Use cache: 'no-store'                                  │
│    - Call revalidatePath() after                            │
│                                                              │
│ 5. Use in components:                                       │
│    Server Component → Best (auto-caching)                   │
│    Client Component → Use useCallback for fetches           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Examples from Our Codebase

### Real Example 1: Products Service (Inventory)

- Location: `src/services/productsService.js`
- Pattern: Split metadata (cached) vs stock (real-time)

### Real Example 2: Sales Service

- Location: `src/services/salesService.js`
- Pattern: Historical (cached 5min) vs active (no-store)

### Real Example 3: Categories Service

- Location: `src/services/categoriesService.js`
- Pattern: Long-term cache (24 hours, rarely changes)

---

## Need Help?

1. **Check existing services** in `src/services/` for similar patterns
2. **Review caching blueprint** in `cacheConfig.js`
3. **Use service template** above as starting point
4. **Test with Network DevTools** - verify cache headers

---

## Summary: 5-Step Checklist

- [ ] Step 1: Determine caching strategy (real-time vs cached)
- [ ] Step 2: Create service file using template
- [ ] Step 3: Add cache duration to config (if needed)
- [ ] Step 4: Use service in component (Server > Client)
- [ ] Step 5: Add revalidation for mutations

**Time per service**: ~10 minutes ✅
