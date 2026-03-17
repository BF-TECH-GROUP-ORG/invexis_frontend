# Invexis App Knowledge & Navigation Guidance

This document serves as the primary knowledge base for the Invexis AI Assistant. It contains the application's purpose, feature overview, navigation structure, form requirements, and safety guidelines.

---

## 1. Application Overview
**Invexis** (also referred to as **Invexix**) is a futuristic business intelligence and management powerhouse. It is designed to help modern businesses (retail, wholesale, services, logistics) manage their operations in real-time.

### Core Value Propositions:
- **Centralized Control**: Manage inventory, sales, staff, debts, and payments in one platform.
- **Real-time Insights**: Live dashboards and automated reports for data-driven decisions.
- **Scalability**: Support for multiple branches (shops) and companies.
- **Role-based Security**: Precision access control for different team members.

---

## 2. Core Modules & Features

### A. Dashboard & Analytics
- **Dashboard**: Real-time overview of KPIs (Total Sales, Profit, Orders, Top Products).
- **Inventory Overview**: Situational awareness of stock health, value distribution, and movement trends.
- **Reports**: System-wide analytics with export capabilities (PDF/Excel) for Sales, Inventory, Debts, and Staff.

### B. Inventory Management
- **Products**: Complete CRUD for products including variants (size, color), attributes, and media.
- **Categories**: Multi-level category hierarchy (up to Level 3) for organized product classification.
- **Stock Operations**: 
  - **Scanner**: QR/Barcode lookup for quick product identification.
  - **Stock In (Bulk)**: Batch processing for adding inventory.
  - **Stock History**: Audit trail of every stock movement.
- **Transfers**: Moving products between shops (Intra-company) or to other companies (Cross-company).

### C. Sales & POS (Stock-Out)
- **Point of Sale (Stock-out)**: Interactive interface to record sales, apply discounts, and select payment methods.
- **Multi-Product Sales**: Process multiple items in a single transaction.
- **Sales History**: Detailed log of all past sales with return/refund capabilities.
- **Receipts/Invoices**: Generation of professional documents for customers.

### D. Financial Management
- **Debts & Receivables**: Tracker for outstanding liabilities with repayment scheduling.
- **Billing & Payments**: Management of invoices, payments, and transaction logs.
- **Payment Methods**:
  - **Cash**: Direct physical payment.
  - **MTN MoMo**: Mobile money (requires phone number).
  - **Airtel Money**: Mobile money (requires phone number).
  - **Bank Transfer**: Electronic transfer.

### E. Personnel & Branch Management
- **Shops (Companies)**: Management of business branches, locations, and capacities.
- **Workers**: Staff directory with roles and department assignments (Management, Sales).
- **Audit Logs**: Comprehensive history of system activities for security and accountability.

---

## 3. User Roles & Permissions
- **Super Admin**: Full system access, including global category and company management.
- **Company Admin**: Full access within their company (manage shops, workers, products, reports).
- **Manager**: Operational management (products, stock, reports).
- **Seller (Sales Manager)**: Focused on sales operations (POS, Sales History, Debts).
- **Viewer**: Read-only access for monitoring.

---

## 4. Navigation Guidance (AI Commands)
To help users navigate live, the AI assistant can trigger navigation by suggesting specific paths. 

### Navigation Map:
| Module | Menu Label | Path |
| :--- | :--- | :--- |
| **Overview** | Dashboard | `/inventory/dashboard` |
| | Notifications | `/inventory/notifications` |
| **Management** | Staff List | `/inventory/workers/list` |
| | Shops | `/inventory/companies` |
| **Inventory** | Master Categories | `/inventory/categories` |
| | Products | `/inventory/products` |
| | Transfers | `/inventory/transfer` |
| | Stock Ops | `/inventory/stock` |
| **Sales** | Sales History | `/inventory/sales/history` |
| | Stock-out | `/inventory/sales/sellProduct/sale` |
| **Financials** | Debts | `/inventory/debts` |
| | Invoices | `/inventory/billing/invoices` |
| | Payments | `/inventory/billing/payments` |
| | Transactions | `/inventory/billing/transactions` |
| **Other** | Documents | `/inventory/documents` |
| | Logs & Audits | `/inventory/logs` |

**AI Navigation Command Syntax:**
To trigger a "Live Navigation", the AI should include the following code block in its response:
```json
{
  "action": "navigate",
  "path": "/inventory/products"
}
```

---

## 5. Form Information Requirements

### Adding a Product:
- **Required**: Product Name, Category (must be Level-3), Base Price, Stock Quantity.
- **Optional but Recommended**: SKU, Brand, Images, Low Stock Alert threshold.

### Adding a Worker:
- **Required**: First Name, Last Name, Email, Phone, National ID, Role, Shop Assignment.
- **Note**: Ensure the National ID follows the standard alphanumeric format.

### Recording a Sale (Stock-out):
- **Required**: Product selection, Selling Price (cannot be below Minimum Price), Quantity.
- **Payment**: If MTN or Airtel is selected, a valid phone number is required.

---

## 6. Warnings & Best Practices

1. **Data Integrity**: Never delete a product that has active sales history or current stock. Instead, mark it as "Inactive".
2. **Returns**: When returning a product, ensure you specify the correct quantity. The system will automatically update stock levels.
3. **Transfers**: Double-check the destination shop before confirming a transfer. Cross-company transfers may involve debt creation if marked as "Debt Transfer".
4. **Permissions**: If a user cannot see a specific menu item, it is likely due to their Role or assigned Department.
5. **Session Safety**: Always logout when using a shared terminal.

---

## 7. FAQs (Frequently Asked Questions)

**Q: How do I add a new shop?**
A: Navigate to **Management > Shops** and click "Add New Branch". This is only available to Company Admins.

**Q: Why can't I save a product?**
A: Check if you have selected a "Level 3" category. The system requires products to be in the most specific category level. Also, ensure all required fields (Name, Price, Stock) are filled.

**Q: How do I handle a customer who wants to pay later?**
A: Use the **Debt Sale** option during the Stock-out process. This will record the transaction and add it to the **Debts** tracker.

**Q: Can I export my sales for the month?**
A: Yes. Go to **Reports**, select the **Sales** tab, choose your date range, and click "Export as PDF" or "Export to Excel".

---

## 8. Support & Registration (Internal Process)

**Registration Note**: New users cannot sign up themselves. They must be registered by an authorized person in our company.
**AI Assistance**: If a user needs a new account, the AI should gather the following:
1. Full Name
2. Business Email
3. Phone Number
4. Company/Branch Name
5. Desired Role

**Contacting Support**: Users can send a message to the support desk at `support@invexix.com` or `onboard@invexix.com`.

---
*Last Updated: March 2026*
