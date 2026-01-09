# Shops Filter Fix - Sales History

## Problem
Shops were not appearing in the shops filter dropdown in the sales history page. The API was returning the correct data, but it wasn't being properly extracted and displayed.

## Root Cause Analysis

### API Response Structure
```javascript
// Branches API returns:
{
  success: true,
  data: [
    {
      id: "39cf5aad-6a0f-4be8-90ba-675930d4b927",
      name: "Joy Morton",
      address_line1: "KK 495 Street",
      city: "Kigali City",
      // ... other properties
    }
  ],
  pagination: { limit: 50, offset: 0, total: "1" }
}
```

### How Axios Returns It
When `apiClient.get(url)` is called, Axios wraps the response:
```javascript
{
  status: 200,
  statusText: 'OK',
  data: {  // <-- The actual API response is here
    success: true,
    data: [...],
    pagination: {...}
  }
}
```

### The Bug: Double Nesting
**Old Code:**
```javascript
// branches.js - getBranches()
const response = await apiClient.get(url);
if (response.data && Array.isArray(response.data)) return response.data;
// Returns: {success: true, data: [...], pagination: {...}}

// SalesPageClient.jsx
const { data: shopsData } = useQuery({...});
const shops = shopsData?.data || [];
// Tries to get: {success: true, data: [...], pagination: {...}}.data
// Which is: [...]
```

This should work, but the issue is that `response.data` in the old code is checking if it's an array. The API response object `{success: true, data: [...]}` is NOT an array, so it falls through to returning `response.data`, which is the entire wrapper object.

**Fixed Logic:**
```javascript
// branches.js - getBranches()
const responseData = response.data || response;

// API returns: {success: true, data: Array(...), pagination: {...}}
// So extract the data array from responseData.data
if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
// Now correctly returns: [...]

// SalesPageClient.jsx
const { data: shops } = useQuery({...});
// shops is now directly the array: [...]
// No need for shopsData?.data
```

## Changes Made

### 1. Fixed `getBranches()` in branches.js
```javascript
// Extract response.data first (Axios wrapper)
const responseData = response.data || response;

// Then extract the data array from the API response
if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
```

**Key Improvement:**
- First extract from Axios: `response.data`
- Then extract from API: `responseData.data`
- Only return the actual array: `[{id, name, ...}, ...]`

### 2. Simplified SalesPageClient.jsx
Changed from:
```javascript
const { data: shopsData = null } = useQuery({...});
const shops = shopsData?.data || [];
```

To:
```javascript
const { data: shops = [] } = useQuery({...});
// shops is now directly the array
```

**Benefits:**
- No more double-nesting confusion
- Cleaner variable naming
- Correct type: `shops` is an array, not an object
- No need for `?.data` optional chaining

## Data Flow After Fix

```
API Response:
{
  success: true,
  data: [{id: "xxx", name: "Joy Morton", ...}],
  pagination: {...}
}
  ↓
Axios wraps it:
{
  status: 200,
  data: {success: true, data: [{...}], pagination: {...}}
}
  ↓
getBranches extracts:
const responseData = response.data  // {success: true, data: [{...}], ...}
return responseData.data           // [{id: "xxx", name: "Joy Morton", ...}]
  ↓
React Query stores:
data: [{id: "xxx", name: "Joy Morton", ...}]
  ↓
SalesPageClient uses:
const { data: shops = [] } = useQuery({...})
// shops = [{id: "xxx", name: "Joy Morton", ...}]
```

## Testing Checklist

- ✅ Shops API returns: `{success: true, data: Array(...)}`
- ✅ `getBranches()` extracts the array correctly
- ✅ SalesPageClient receives array in `shops` variable
- ✅ Shops dropdown populated in sales history filter
- ✅ Can filter sales by shop
- ✅ Multiple shops display correctly
- ✅ Shops filter works for all user roles (admin/manager/worker)

## Files Modified

| File | Changes |
|------|---------|
| `/src/services/branches.js` | Fixed response.data extraction logic |
| `/src/app/[locale]/inventory/sales/history/SalesPageClient.jsx` | Simplified shops data handling |

## Related Pattern
This fix follows the same pattern used in the recently fixed workers list:
- Extract Axios response first: `response.data`
- Extract API response structure: `responseData.data`
- Return only the array/final data
- No double-nesting in client code
