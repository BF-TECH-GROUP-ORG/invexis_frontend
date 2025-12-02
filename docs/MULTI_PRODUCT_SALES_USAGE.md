# MultiProductSalesTable Component - Usage Guide

## 📋 Overview

The `MultiProductSalesTable` component allows users to select multiple products from inventory, set individual prices and quantities, and process them as a single sale transaction.

## 🎯 Features

✅ **Checkbox Selection** - Select/deselect products from inventory  
✅ **Quantity Control** - Increment/decrement or type quantity (min: 1)  
✅ **Price Validation** - Set selling price with minimum price validation  
✅ **Premium Modal** - Beautiful modal for setting individual product prices  
✅ **Batch Selling** - Sell multiple products in a single transaction  
✅ **Visual Feedback** - Selected rows are highlighted with orange tones  
✅ **Disabled States** - Quantity and price controls disabled until row is selected  

---

## 🚀 Quick Start

### 1. Import the Component

```javascript
import { MultiProductSalesTable } from "@/app/[locale]/inventory/sales/table";
import { getAllProducts } from "@/services/salesService";
```

### 2. Fetch Products Data

```javascript
"use client";
import { useQuery } from "@tanstack/react-query";
import { MultiProductSalesTable } from "@/app/[locale]/inventory/sales/table";
import { getAllProducts } from "@/services/salesService";

export default function MultiSalesPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const handleSell = async (payload) => {
    console.log("Selling:", payload);
    // Call your API here
    // await sellProducts(payload);
  };

  return <MultiProductSalesTable products={products} onSell={handleSell} />;
}
```

---

## 📦 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `products` | `Array` | Yes | Array of product objects |
| `onSell` | `Function` | No | Callback function when "SELL SELECTED" is clicked |

### Product Object Structure

Each product in the `products` array should have:

```javascript
{
  id: "67415e3d3a05f8f8a8df3f9c",           // Unique product ID
  ProductName: "Wireless Mouse",             // Display name
  Price: 15000,                              // Minimum selling price (in FRW)
  // ... other fields are optional
}
```

---

## 🎨 UI Components

### 1. **Table Header**
- Shows "Multi-Product Sale" title
- "SELL SELECTED (count)" button (disabled when count = 0)

### 2. **Table Columns**
- **Select** - Checkbox for row selection
- **Product Name** - Name of the product
- **Min Price (FRW)** - Minimum allowed selling price
- **Selling Price (FRW)** - Current selling price (shows "-" if not selected)
- **Quantity** - Number input with +/- buttons
- **Actions** - "Set Price" button

### 3. **Price Modal**
- Header with product name (orange background)
- Shows minimum price
- Input field for selling price
- Validation error message
- Cancel and Save buttons

---

## 🔧 Internal State

The component maintains state in this structure:

```javascript
selectedItems = {
  "67415e3d3a05f8f8a8df3f9c": {
    productId: "67415e3d3a05f8f8a8df3f9c",
    name: "Wireless Mouse",
    qty: 3,
    minPrice: 15000,
    price: 18000
  },
  // ... more selected items
}
```

---

## 📤 Output Payload

When the user clicks "SELL SELECTED", the `onSell` callback receives:

```javascript
{
  soldBy: "691d8f766fb4aca9a9fa619b",  // Placeholder - replace with actual user ID
  shopId: "691d8f766fb4aca9a9fa619b",  // Placeholder - replace with actual shop ID
  items: [
    {
      productId: "67415e3d3a05f8f8a8df3f9c",
      quantity: 3,
      sellingPrice: 18000
    },
    {
      productId: "67415e3d3a05f8f8a8df3f9e",
      quantity: 1,
      sellingPrice: 25000
    }
  ]
}
```

---

## 🎯 User Flow

1. **Select Products**
   - User checks the checkbox next to products they want to sell
   - Row highlights in orange
   - Quantity defaults to 1, price defaults to minimum price

2. **Adjust Quantity**
   - Click +/- buttons or type directly
   - Minimum quantity is 1 (enforced)

3. **Set Selling Price**
   - Click "Set Price" button
   - Modal opens with product name
   - Enter price ≥ minimum price
   - Validation shows error if price < minimum
   - Save updates the price

4. **Sell Selected**
   - Click "SELL SELECTED (X)" button
   - `onSell` callback is triggered with payload
   - Selection is cleared after successful sale

---

## 🎨 Styling

The component uses Material-UI with a premium orange theme:

- **Primary Color**: `#FF6D00` (Orange 800)
- **Hover Color**: `#E65100` (Orange 900)
- **Selection Background**: `#FFF3E0` (Orange 50)
- **Hover Background**: `#FFE0B2` (Orange 100)

All colors match the INVEXIS brand guidelines.

---

## ⚠️ Important Notes

### Validation Rules

1. **Quantity**: Must be ≥ 1
2. **Selling Price**: Must be ≥ Minimum Price (product.Price)
3. **Selection**: At least 1 product must be selected to enable "SELL SELECTED"

### Placeholders to Update

Replace these placeholders in production:

```javascript
soldBy: "691d8f766fb4aca9a9fa619b"  // Replace with actual logged-in user ID
shopId: "691d8f766fb4aca9a9fa619b"  // Replace with actual shop ID
```

You can get these from:
- User context/session
- Local storage
- Authentication provider

---

## 🔌 Integration Example

### Complete Page Example

```javascript
"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MultiProductSalesTable } from "@/app/[locale]/inventory/sales/table";
import { getAllProducts } from "@/services/salesService";
import { SellProduct } from "@/services/salesService";

export default function MultiSalesPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const sellMutation = useMutation({
    mutationFn: (payload) => {
      // Transform payload to match your API
      const apiPayload = {
        ...payload,
        companyId: "a6e0c5ff-8665-449d-9864-612ab1c9b9f2",
        customerName: "Walk-in Customer",
        customerPhone: "+250788000000",
        customerEmail: "",
        paymentMethod: "cash",
        totalAmount: payload.items.reduce((sum, item) => 
          sum + (item.sellingPrice * item.quantity), 0
        ),
        items: payload.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          totalPrice: item.sellingPrice * item.quantity
        }))
      };
      
      return SellProduct(apiPayload);
    },
    onSuccess: () => {
      alert("Sale successful!");
    },
    onError: (error) => {
      console.error("Sale failed:", error);
      alert("Sale failed. Please try again.");
    }
  });

  const handleSell = (payload) => {
    sellMutation.mutate(payload);
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div>
      <MultiProductSalesTable 
        products={products} 
        onSell={handleSell} 
      />
    </div>
  );
}
```

---

## 🎬 Demo

To see the component in action:

1. Import products data (ensure products have `id`, `ProductName`, and `Price`)
2. Render `<MultiProductSalesTable products={products} onSell={handleSell} />`
3. Select products, adjust quantities and prices
4. Click "SELL SELECTED"
5. Check console for payload structure

---

## 🐛 Troubleshooting

### "Set Price" button not working
- Ensure the row is selected (checkbox checked)
- Check browser console for errors

### Price validation not working
- Ensure product.Price is a valid number
- Check that tempPrice is being parsed correctly

### Quantity stuck at 1
- Verify that handleQuantityChange is being called
- Check that selectedItems state is updating

---

## 📝 License

Part of the INVEXIS Inventory Management System
