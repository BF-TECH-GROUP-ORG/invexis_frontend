# Known Issues and Solutions

## 1. Image Upload - 413 Content Too Large Error

### Problem
When adding products with images using Simple Form mode, you get:
```
POST https://granitic-jule-haunting.ngrok-free.dev/api/inventory/v1/products 413 (Content Too Large)
```

### Root Cause
Images are being converted to base64 strings and included in the JSON payload. A single high-resolution image can be 2-5MB in base64 format, making the total request exceed the server's limit (typically 1-10MB).

### Solutions

#### Option A: Upload Images to Cloud Storage (Recommended)
1. Use a service like Cloudinary, AWS S3, or similar
2. Upload images first, get back URLs
3. Send only the URLs in the product creation payload

Example flow:
```javascript
// 1. Upload images to Cloudinary
const uploadedImageUrls = await Promise.all(
  formData.images.map(img => uploadToCloudinary(img.url))
);

// 2. Replace base64 with URLs
const productData = {
  ...formData,
  images: uploadedImageUrls.map(url => ({ url, isPrimary: false }))
};

// 3. Send to backend
await dispatch(createProduct(productData));
```

#### Option B: Increase Server Payload Limit
Update your backend server configuration:

**Express.js:**
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

**Nginx:**
```nginx
client_max_body_size 50M;
```

#### Option C: Use FormData for File Uploads
Modify the product creation to use `multipart/form-data`:

```javascript
const formDataObj = new FormData();
formDataObj.append('name', formData.name);
formDataObj.append('price', formData.pricing.basePrice);

// Append actual files instead of base64
formData.images.forEach((img, index) => {
  if (img.file) {
    formDataObj.append('images', img.file);
  }
});

await axios.post('/api/products', formDataObj, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Current Workaround
For testing, you can:
1. Add products without images first
2. Or use very small images (< 100KB each)
3. Or limit to 1-2 images maximum

---

## 2. Warehouse Service Connection Error

### Problem
```
GET http://localhost:5000/api/warehouses net::ERR_CONNECTION_REFUSED
```

### Solution
✅ **FIXED** - Updated `warehousesSlice.js` to use the correct API endpoint:
```javascript
const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://granitic-jule-haunting.ngrok-free.dev/api/inventory/v1';
```

---

## 3. cdn.example.com Image Error

### Problem
```
GET https://cdn.example.com/products/ts-premium-1.jpg net::ERR_NAME_NOT_RESOLVED
```

### Root Cause
`cdn.example.com` is a placeholder URL configured in `next.config.mjs` that doesn't exist.

### Solution
✅ **FIXED** - Added `unoptimized` prop to images from this domain in `ProductTable.jsx`

To fully resolve:
1. Replace `cdn.example.com` in `next.config.mjs` with your actual CDN domain
2. Or remove it if not needed:

```javascript
// next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
    // Remove this if not using:
    // {
    //   protocol: "https",
    //   hostname: "cdn.example.com",
    // },
  ],
}
```

---

## 4. CORS Errors (Previously Fixed)

### Problem
```
Access to XMLHttpRequest at '...' has been blocked by CORS policy: 
Request header field access-control-allow-origin is not allowed
```

### Solution
✅ **FIXED** - Removed invalid `Access-Control-Allow-Origin` header from request headers in `categoriesService.js`

**Note:** `Access-Control-Allow-Origin` is a **response header** set by the server, not a request header sent by the client.

---

## Recommendations

1. **Image Handling Priority:**
   - Implement Cloudinary or S3 integration for production
   - This will solve the 413 error and improve performance

2. **Environment Variables:**
   - Ensure `.env.local` has correct API URLs:
   ```
   NEXT_PUBLIC_INVENTORY_API_URL=https://granitic-jule-haunting.ngrok-free.dev/api/inventory/v1
   ```

3. **Backend Configuration:**
   - If using ngrok, ensure it's running and the URL is current
   - Consider increasing payload limits if needed temporarily

4. **Testing:**
   - Test product creation with small images first
   - Verify warehouse endpoint is accessible
   - Check all API endpoints return expected data structures
