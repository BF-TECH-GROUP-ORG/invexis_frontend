# Sales Analysis Tab - Complete Documentation

## Overview

The Sales Tab in the Reports section provides a **hierarchical view of all sales transactions** organized by date and branch, with comprehensive details about quantities, values, customer information, and sales tracking.

---

## Table Structure

### Main Headers (Level 1)
```
+------------+--------+-------------+-------------------+------------------------------+----------------------+------------------------+-------------------+
|            |        |             |                   |        SALES QUANTITY        |     SALES VALUE     |      CUSTOMER INFO    |    TRACKING       |
|    DATE    | BRANCH | INVOICE NO  | PRODUCT NAME      |------------------------------|----------------------|------------------------|-------------------|
|            |        |             |                   | QTY SOLD | RETURNS | NET QTY | UNIT PRICE | TOTAL AMOUNT | CUSTOMER | TYPE | SALE TIME | SOLD BY |
+------------+--------+-------------+-------------------+----------+---------+---------+------------+--------------+----------+------+-----------+---------+
```

### Hierarchy Levels

**Level 1: Date Row**
- Shows the transaction date
- Spans all columns
- Separate visual styling

**Level 2: Branch Row**
- Shows the branch name (e.g., "North Branch")
- Indented below date
- Separate visual styling

**Level 3: Individual Sales Records**
- Each row represents one sale transaction
- Contains all detailed information
- Collapsible with arrow indicator

---

## Data Structure

### Mock Data Format
```javascript
{
  date: '02/15/2022',
  shops: [
    {
      name: 'North Branch',
      sales: [
        {
          invoiceNo: 'INV-2022-001',
          productName: 'iPhone 15 Pro Max',
          quantity: {
            sold: 2,      // Qty Sold
            returns: 0,   // Returns
            net: 2        // Net Qty (Sold - Returns)
          },
          value: {
            unitPrice: 1200000,   // Unit Price
            totalAmount: 2400000  // Total Amount (Unit Price × Net Qty)
          },
          customer: {
            name: 'John Doe',     // Customer Name
            type: 'Retail'        // Customer Type (Retail/Wholesale/Corporate)
          },
          tracking: {
            saleTime: '10:30 AM',  // Time of Sale
            soldBy: 'Alice'        // Salesperson Name
          }
        },
        // More sales...
      ]
    },
    // More branches...
  ]
}
```

---

## Column Definitions

### DATE & BRANCH
| Column | Purpose | Notes |
|--------|---------|-------|
| **DATE** | Transaction date | Clickable dropdown to filter by date |
| **BRANCH** | Store/shop location | Clickable dropdown to filter by branch |

### INVOICE & PRODUCT
| Column | Purpose | Notes |
|--------|---------|-------|
| **INVOICE NO** | Unique invoice identifier | Format: INV-YYYY-XXX |
| **PRODUCT NAME** | Name of product sold | Expandable with arrow icon |

### SALES QUANTITY
| Column | Purpose | Notes |
|--------|---------|-------|
| **QTY SOLD** | Number of units sold | Integer value |
| **RETURNS** | Units returned | Integer value |
| **NET QTY** | Qty Sold - Returns | Calculated field |

### SALES VALUE
| Column | Purpose | Notes |
|--------|---------|-------|
| **UNIT PRICE** | Price per unit | In FRW currency |
| **TOTAL AMOUNT** | Unit Price × Net Qty | Calculated total value |

### CUSTOMER INFO
| Column | Purpose | Notes |
|--------|---------|-------|
| **CUSTOMER** | Customer name | Individual/Company name |
| **TYPE** | Customer classification | Retail / Wholesale / Corporate |

### TRACKING
| Column | Purpose | Notes |
|--------|---------|-------|
| **SALE TIME** | Time of transaction | Format: HH:MM AM/PM |
| **SOLD BY** | Salesperson name | Staff member who made the sale |

---

## KPI Dashboard Cards

Located at the top of the tab, 4 key metrics:

### 1. Total Revenue
- **Value:** Sum of all total amounts
- **Icon:** Attach Money (Orange #FF6D00)
- **Trend:** Up (indicates positive sales)
- **Example:** 45,800,000 FRW

### 2. Net Profit
- **Value:** Revenue - Costs
- **Icon:** Trending Up (Green #10B981)
- **Purpose:** Shows actual profit
- **Example:** 12,400,000 FRW

### 3. Total Orders
- **Value:** Count of all sales transactions
- **Icon:** Shopping Cart (Blue #3B82F6)
- **Purpose:** Transaction volume
- **Example:** 856 orders

### 4. Average Order Value
- **Value:** Total Revenue ÷ Total Orders
- **Icon:** Receipt Long (Purple #8B5CF6)
- **Purpose:** Average transaction value
- **Example:** 53,504.673 FRW

---

## Features

### 1. Date Filter
```javascript
handleDateClick(event) {
  // Opens dropdown menu with available dates
  // Options: '02/15/2022', '02/14/2022', etc.
}

handleDateSelect(date) {
  // Filters data by selected date
  // Re-renders table with filtered results
}
```

### 2. Branch Filter
```javascript
handleBranchClick(event) {
  // Opens dropdown menu with branch options
  // Options: 'All', 'None', 'North Branch', 'South Branch'
}

handleBranchSelect(branch) {
  // Filters data by selected branch
  // Supports 'All' to show all branches
  // Supports 'None' to show empty state
}
```

### 3. Hierarchical Display
- **Date rows:** Full-width, bold styling
- **Branch rows:** Indented, slightly smaller font
- **Sale rows:** Indented further, regular font with expand arrow
- **Spacer rows:** Small gap between branch groups for visual clarity

### 4. Expandable Rows
- Product names have arrow indicators
- Can be expanded for additional details (future enhancement)
- Current implementation shows all details inline

---

## Styling Details

### Table Appearance
- **Header Background:** Dark gray (#333)
- **Header Text Color:** White
- **Header Font Size:** 0.85rem for main, 0.7rem for sub-headers
- **Body Background:** White (#fff)
- **Body Text Color:** Dark gray (#111827)
- **Borders:** Light gray (#e5e7eb)

### Cell Alignment
- **Numeric columns:** Centered
- **Text columns:** Left-aligned with padding
- **Product names:** Left-aligned with indentation and icon

### Responsive Design
- **Overflow:** Horizontal scroll on small screens
- **Border Radius:** 0 (flush layout)
- **Elevation:** Minimal shadow for clean look

---

## Data Flow

### Initialization
```
Component Mount
    ↓
Initialize state (selectedDate, selectedBranch)
    ↓
useEffect triggers
    ↓
Fetch/Load mock data
    ↓
Calculate summary statistics
    ↓
Filter by selected date/branch
    ↓
Set reportData & stats
    ↓
Render Table with KPIs
```

### Filter Update
```
User clicks Date/Branch selector
    ↓
Menu opens with options
    ↓
User selects option
    ↓
Handler updates state
    ↓
useEffect re-runs with new filters
    ↓
Data filtered by selection
    ↓
Table re-renders with new data
```

---

## Current Mock Data

The component includes realistic sample data:

### North Branch Sales
- **INV-2022-001:** iPhone 15 Pro Max
  - Sold: 2 | Returns: 0 | Net: 2
  - Unit: 1,200,000 | Total: 2,400,000 FRW
  - Customer: John Doe (Retail)
  - Time: 10:30 AM | Sold By: Alice

- **INV-2022-002:** Sony WH-1000XM5
  - Sold: 5 | Returns: 1 | Net: 4
  - Unit: 350,000 | Total: 1,400,000 FRW
  - Customer: Jane Smith (Wholesale)
  - Time: 11:45 AM | Sold By: Bob

### South Branch Sales
- **INV-2022-003:** MacBook Air M2
  - Sold: 1 | Returns: 0 | Net: 1
  - Unit: 1,500,000 | Total: 1,500,000 FRW
  - Customer: Tech Solutions (Corporate)
  - Time: 2:15 PM | Sold By: Charlie

---

## Integration Points

### Session Data
```javascript
const { data: session } = useSession();
const companyId = session?.user?.companies?.[0]?.id;
```

### Props
```javascript
SalesTab({ dateRange }) {
  // dateRange can be used for date picker integration
}
```

### Dependencies
- React hooks (useState, useEffect)
- Material-UI components (Table, Grid, Menu, etc.)
- Lucide React icons
- Framer Motion for animations
- NextAuth for session

---

## Calculation Formulas

### Net Quantity
```
Net Qty = Qty Sold - Returns
```

### Total Amount
```
Total Amount = Unit Price × Net Qty
```

### Average Order Value
```
Avg Order Value = Total Revenue ÷ Total Orders
```

### Summary Stats
```
Total Revenue = Sum of all Total Amounts
Total Orders = Count of all sales records
Total Profit = Revenue - (Cost per Item × Total Items Sold)
```

---

## Customization Guide

### Adding More Columns
1. Add to mock data structure
2. Add TableCell to sub-header row
3. Add TableCell to data row with proper alignment
4. Adjust colSpan on header cells

### Changing Colors
```javascript
// Header background
bgcolor: "#333"  // Change to desired color

// Icons in KPI cards
color="#FF6D00"  // Change to desired color

// Borders
borderRight: "1px solid #e5e7eb"  // Change border color
```

### Adding Filters
```javascript
// New filter state
const [selectedCustomer, setSelectedCustomer] = useState('All');

// Add handler
const handleCustomerClick = (event) => setCustomerAnchor(event.currentTarget);

// Add menu
<Menu anchorEl={customerAnchor} ...>
  <MenuItem onClick={() => handleCustomerSelect(name)}>Name</MenuItem>
</Menu>
```

### Real Data Integration
Replace mock data fetch with API call:
```javascript
useEffect(() => {
  const fetchSales = async () => {
    const { data } = await getSalesReport(companyId, {
      date: selectedDate,
      branch: selectedBranch
    });
    setReportData(data);
  };
  fetchSales();
}, [selectedDate, selectedBranch]);
```

---

## Performance Considerations

### Current
- Mock data with ~2 sales per branch
- Instant rendering (~800ms simulated delay)
- Suitable for up to 100-200 sales records

### For Large Datasets
1. **Pagination:** Add table pagination
2. **Virtual Scrolling:** Implement React Window
3. **Lazy Loading:** Load data on scroll
4. **Search:** Add product/customer search
5. **Caching:** Implement React Query

---

## Future Enhancements

- [ ] Real API integration for sales data
- [ ] Advanced filtering by customer type, salesperson
- [ ] Export to CSV/PDF functionality
- [ ] Product details expandable sections
- [ ] Profit margin calculations per product
- [ ] Date range picker instead of dropdown
- [ ] Search functionality
- [ ] Sorting by columns
- [ ] Return reason tracking
- [ ] Commission calculations for salespersons
- [ ] Customer payment status integration
- [ ] Discount/promotion tracking

---

## Code Quality

### ✅ Strengths
- Hierarchical data structure is clear and organized
- Consistent styling with Inventory tab
- Responsive layout with horizontal scrolling
- Good use of MUI components
- Proper state management
- Clear data filtering logic

### 📋 Maintenance Notes
- Test filters when adding new branches
- Verify calculations with real data
- Update mock data format if schema changes
- Monitor performance with large datasets

---

## Summary

The **Sales Tab** provides a comprehensive, hierarchical view of all sales transactions with:

✅ Date & Branch filtering  
✅ Complete sales details (quantities, values, customer info, tracking)  
✅ KPI dashboard with key metrics  
✅ Professional hierarchical layout  
✅ Responsive design  
✅ Ready for real data integration  

Perfect for **daily sales analysis, trend tracking, and performance monitoring**.
