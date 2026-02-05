# Inventory vs Sales Analysis Tabs - Comparative Structure

## Side-by-Side Overview

Both tabs follow the same **hierarchical data structure pattern** but with domain-specific columns.

---

## Column Comparison

### INVENTORY TAB
```
+--------+--------+---------------+----------+------+-----+-----+-----+----------+----------+---------+---------+-----+----------------+----------+
| DATE   | BRANCH | PRODUCT NAME  | CATEGORY | OPEN | IN  | OUT | OUT | UNIT CST | TOTAL VL | REORDER | STATUS  | AGE | LAST RESTOCK   | LAST MOVE|
+--------+--------+---------------+----------+------+-----+-----+-----+----------+----------+---------+---------+-----+----------------+----------+

Focuses on: Stock levels, movements, values, and reordering needs
```

### SALES TAB
```
+--------+--------+----------+---------------+----------+---------+---------+----------+----------+----------+------+----------+---------+
| DATE   | BRANCH | INVOICE  | PRODUCT NAME  |QTY SOLD  | RETURNS | NET QTY | UNIT PRC | TOTAL $  | CUSTOMER | TYPE | SALE TIM | SOLD BY |
+--------+--------+----------+---------------+----------+---------+---------+----------+----------+----------+------+----------+---------+

Focuses on: Sales transactions, quantities, values, and customer details
```

---

## Column Mapping

| Aspect | Inventory | Sales | Purpose |
|--------|-----------|-------|---------|
| **Identification** | Product Name | Invoice No + Product | Unique transaction ID |
| **Category** | Category | Customer Type | Classification |
| **Quantities** | Open/In/Out/Close | Sold/Returns/Net | Movement tracking |
| **Values** | Unit Cost / Total | Unit Price / Total | Financial tracking |
| **Time** | Last Restock / Last Move | Sale Time | Activity timing |
| **Actor** | - | Sold By | Responsibility tracking |

---

## Data Structure Comparison

### INVENTORY TAB - Stock Movement Focus
```javascript
{
  date: '02/15/2022',
  shops: [
    {
      name: 'North Branch',
      products: [
        {
          name: 'iPhone 15 Pro Max',
          category: 'Electronics',
          movement: {
            open: 50,    // Opening stock
            in: 20,      // Stock received
            out: 15,     // Stock sold
            close: 55    // Closing stock
          },
          value: {
            unitCost: 1200000,      // Cost per unit
            totalValue: 66000000    // Total stock value
          },
          status: {
            reorder: 10,            // Reorder point
            status: 'In Stock',     // Stock status
            age: 12                 // Days in stock
          },
          tracking: {
            lastRestock: '02/01/2022',  // Last receipt
            lastMove: '02/14/2022'      // Last movement
          }
        }
      ]
    }
  ]
}
```

### SALES TAB - Transaction Focus
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
            sold: 2,        // Units sold
            returns: 0,     // Units returned
            net: 2          // Net = Sold - Returns
          },
          value: {
            unitPrice: 1200000,     // Selling price per unit
            totalAmount: 2400000    // Total = Unit Price × Net
          },
          customer: {
            name: 'John Doe',       // Customer name
            type: 'Retail'          // Customer segment
          },
          tracking: {
            saleTime: '10:30 AM',   // When sold
            soldBy: 'Alice'         // Who sold it
          }
        }
      ]
    }
  ]
}
```

---

## KPI Metrics Comparison

### INVENTORY TAB KPIs
| KPI | Metric | Focus |
|-----|--------|-------|
| **Total Stock Value** | Sum of all stock values | Asset valuation |
| **Total Items** | Count of unique products | Inventory breadth |
| **Low Stock Items** | Count < reorder point | Action needed |
| **Out of Stock** | Count of zero-stock items | Critical issues |

### SALES TAB KPIs
| KPI | Metric | Focus |
|-----|--------|-------|
| **Total Revenue** | Sum of all sales amounts | Financial performance |
| **Net Profit** | Revenue - Costs | Bottom line |
| **Total Orders** | Count of transactions | Sales volume |
| **Avg Order Value** | Revenue ÷ Orders | Average transaction |

---

## Use Cases

### INVENTORY TAB - Answer These Questions
✅ How much stock do we have?  
✅ What's the total inventory value?  
✅ Which items are low on stock?  
✅ Which items are out of stock?  
✅ When was each item last restocked?  
✅ How old is the inventory?  
✅ What's the stock movement pattern?  

### SALES TAB - Answer These Questions
✅ How many units did we sell?  
✅ What's the total revenue?  
✅ What's the profit margin?  
✅ How many transactions occurred?  
✅ What's the average sale value?  
✅ Who was the customer?  
✅ Who made the sale?  
✅ What was the return rate?  

---

## Hierarchy Structure Comparison

### INVENTORY TAB Hierarchy
```
Date (e.g., 02/15/2022)
  ├── Shop (e.g., North Branch)
  │   ├── Product 1
  │   ├── Product 2
  │   └── Product N
  └── Shop (e.g., South Branch)
      ├── Product 1
      └── Product N
```

### SALES TAB Hierarchy
```
Date (e.g., 02/15/2022)
  ├── Shop (e.g., North Branch)
  │   ├── Sale/Invoice 1
  │   ├── Sale/Invoice 2
  │   └── Sale/Invoice N
  └── Shop (e.g., South Branch)
      ├── Sale/Invoice 1
      └── Sale/Invoice N
```

**Note:** Both use the same 3-level hierarchy pattern:
1. **Level 1:** Date (spans full width)
2. **Level 2:** Branch/Shop (indented)
3. **Level 3:** Detail rows (further indented)

---

## Column Count & Span

### INVENTORY TAB
```
Main Headers (14 columns):
  DATE | BRANCH | PRODUCT | CATEGORY | MOVEMENT(4) | VALUE(2) | STATUS(3) | TRACKING(2)
       |        |         |          |↓↓↓↓         |↓↓       |↓↓↓       |↓↓

Total: 14 columns
```

### SALES TAB
```
Main Headers (13 columns):
  DATE | BRANCH | INVOICE | PRODUCT | QUANTITY(3) | VALUE(2) | CUSTOMER(2) | TRACKING(2)
       |        |         |         |↓↓↓          |↓↓        |↓↓          |↓↓

Total: 13 columns
```

---

## Styling Consistency

Both tabs use identical styling patterns:

### Header Styling
```javascript
// Main Headers
bgcolor: "#333"                    // Dark gray
color: "white"
fontWeight: "700"
fontSize: "0.85rem"
py: 1.5

// Sub Headers
bgcolor: "#333"
fontSize: "0.7rem"
py: 0.5
```

### Body Styling
```javascript
// Date Row
bgcolor: "white"
fontWeight: "700"
fontSize: "0.85rem"
py: 1

// Shop Row
fontWeight: "700"
fontSize: "0.8rem"
py: 0.5

// Data Rows
fontSize: "0.8rem"
py: 0.5
```

### Borders
```javascript
borderRight: "1px solid #bbadadff"   // Header borders
borderBottom: "1px solid #e5e7eb"    // Body borders
```

---

## Interactive Features Comparison

### INVENTORY TAB Filters
```javascript
✅ Date dropdown         (e.g., 02/15/2022, 02/14/2022)
✅ Branch dropdown       (All, None, North Branch, South Branch)
```

### SALES TAB Filters
```javascript
✅ Date dropdown         (e.g., 02/15/2022, 02/14/2022)
✅ Branch dropdown       (All, None, North Branch, South Branch)
```

**Both** support the same filtering mechanism, ready for additional filters like:
- [ ] Customer type
- [ ] Salesperson
- [ ] Product category
- [ ] Date range picker

---

## Component Integration

### Shared Components
```javascript
import ReportKPI from './ReportKPI';           // ✅ Both use this
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';  // ✅ Both
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';          // ✅ Both
```

### Shared Patterns
```javascript
// Session management
const { data: session } = useSession();        // ✅ Both
const companyId = session?.user?.companies[0]; // ✅ Both

// State management
const [selectedDate, setSelectedDate] = useState('02/15/2022');    // ✅ Both
const [selectedBranch, setSelectedBranch] = useState('All');       // ✅ Both

// Loading state
const [loading, setLoading] = useState(true);  // ✅ Both
```

---

## Extension Points

### Add a New Tab Following This Pattern
```javascript
// 1. Create new component in components/
// 2. Copy structure from either Inventory or Sales tab
// 3. Modify columns to match your domain
// 4. Update KPIs to match your metrics
// 5. Customize mock data structure
// 6. Import in page.jsx
// 7. Add to tab navigation

// Example: StaffTab, CustomersTab, ExpensesTab
```

### Fields to Customize
```javascript
// Mock data structure
const mockData = [
  {
    date: ...,
    shops: [
      {
        name: ...,
        records: [  // ← Change this based on domain
          {
            // Domain-specific fields
          }
        ]
      }
    ]
  }
];

// Summary statistics
const mockStats = {
  metric1: ...,   // ← Customize to your domain
  metric2: ...,
  metric3: ...,
  metric4: ...
};

// KPI Cards
<ReportKPI title="..." value={...} icon={...} />  // ← Customize
```

---

## Summary Table

| Feature | Inventory | Sales |
|---------|-----------|-------|
| **Purpose** | Stock analysis | Sales analysis |
| **Detail Level** | Product stock states | Individual transactions |
| **Columns** | 14 | 13 |
| **KPI Count** | 4 | 4 |
| **Hierarchy Levels** | 3 (Date/Branch/Product) | 3 (Date/Branch/Sale) |
| **Date Filter** | ✅ | ✅ |
| **Branch Filter** | ✅ | ✅ |
| **Sortable** | ❌ (future) | ❌ (future) |
| **Exportable** | ❌ (future) | ❌ (future) |
| **Real API** | ❌ (mock data) | ❌ (mock data) |

---

## Recommendations

### For Implementation
1. ✅ Sales Tab is **already complete** with proper structure
2. ✅ Follows same pattern as Inventory Tab
3. ✅ Ready for real API integration
4. ✅ All columns properly mapped

### For Enhancement
1. Add real data API integration
2. Implement additional filters (customer, salesperson, product)
3. Add export to CSV/PDF
4. Implement sorting by column
5. Add date range picker
6. Add search functionality
7. Implement pagination for large datasets

### For Consistency
1. Both tabs maintain visual consistency
2. Same filtering pattern
3. Same loading states
4. Same table structure
5. Same color scheme
6. Same icon usage

---

**Status:** ✅ **SALES TAB IS COMPLETE AND MATCHES INVENTORY TAB PATTERN**

The Sales Tab already provides the exact structure you requested with proper hierarchical organization and all required columns for sales analysis.
