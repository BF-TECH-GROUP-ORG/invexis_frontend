import { 
  LayoutDashboard, 
  Bell, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingBag, 
  Wallet, 
  Receipt, 
  Files, 
  History,
  Tags,
  Truck,
  Database,
  FileSearch,
  CreditCard
} from "lucide-react";

/**
 * Registry of all searchable static pages in the application.
 * Added 'keywords' for semantic/intelligent search.
 */
export const getSearchablePages = (t) => [
  {
    id: "nav-dashboard",
    title: t("sidebar.dashboard"),
    subtitle: "Overview of your business metrics",
    icon: <LayoutDashboard size={20} />,
    link: "/inventory/dashboard",
    type: "page",
    keywords: ["home", "main", "overview", "stats", "analytics", "summary"]
  },
  {
    id: "nav-notifications",
    title: t("sidebar.notifications"),
    subtitle: "Recent alerts and updates",
    icon: <Bell size={20} />,
    link: "/inventory/notifications",
    type: "page",
    keywords: ["alerts", "messages", "inbox", "updates", "news"]
  },
  {
    id: "nav-reports",
    title: t("sidebar.reports"),
    subtitle: "Detailed analytics and insights",
    icon: <BarChart3 size={20} />,
    link: "/inventory/reports",
    type: "page",
    keywords: ["analytics", "charts", "data", "performance", "business", "stats"]
  },
  {
    id: "nav-workers",
    title: t("sidebar.staffList"),
    subtitle: "Manage your employees and workers",
    icon: <Users size={20} />,
    link: "/inventory/workers/list",
    type: "page",
    keywords: ["staff", "employees", "team", "people", "management", "workers"]
  },
  {
    id: "nav-shops",
    title: t("sidebar.shops"),
    subtitle: "View and manage all company branches",
    icon: <Database size={20} />,
    link: "/inventory/companies",
    type: "page",
    keywords: ["branches", "locations", "stores", "outlets", "business units"]
  },
  {
    id: "nav-categories",
    title: t("categories.list.title"),
    subtitle: "Product categories management",
    icon: <Tags size={20} />,
    link: "/inventory/categories",
    type: "page",
    keywords: ["groups", "types", "sorting", "inventory classification"]
  },
  {
    id: "nav-products",
    title: t("sidebar.products"),
    subtitle: "Full product inventory",
    icon: <Package size={20} />,
    link: "/inventory/products",
    type: "page",
    keywords: ["inventory", "items", "stock", "goods", "catalog"]
  },
  {
    id: "nav-transfers",
    title: t("sidebar.transfers"),
    subtitle: "Manage inventory transfers between shops",
    icon: <Truck size={20} />,
    link: "/inventory/transfer",
    type: "page",
    keywords: ["moving", "shipping", "internal", "branch to branch", "stock move"]
  },
  {
    id: "nav-stock",
    title: t("sidebar.stockOps"),
    subtitle: "Adjust and monitor stock levels",
    icon: <Database size={20} />,
    link: "/inventory/stock",
    type: "page",
    keywords: ["inventory", "levels", "adjustment", "stocktake", "counting"]
  },
  {
    id: "nav-sales-history",
    title: t("sidebar.salesHistory"),
    subtitle: "View past sales and transactions",
    icon: <History size={20} />,
    link: "/inventory/sales/history",
    type: "page",
    keywords: ["receipts", "past orders", "sold items", "archive"]
  },
  {
    id: "nav-pos",
    title: t("sidebar.stockOut"),
    subtitle: "Point of Sale - Sell products",
    icon: <ShoppingBag size={20} />,
    link: "/inventory/sales/sellProduct/sale",
    type: "page",
    keywords: ["pos", "selling", "checkout", "retail", "cashier"]
  },
  {
    id: "nav-debts",
    title: t("sidebar.debts"),
    subtitle: "Track customer balances and payments",
    icon: <Wallet size={20} />,
    link: "/inventory/debts",
    type: "page",
    keywords: ["money", "unpaid", "credit", "balances", "customers", "debtors"]
  },
  {
    id: "nav-invoices",
    title: t("sidebar.invoices"),
    subtitle: "Manage and generate billing invoices",
    icon: <FileSearch size={20} />,
    link: "/inventory/billing/invoices",
    type: "page",
    keywords: ["billing", "paperwork", "orders", "payment requests"]
  },
  {
    id: "nav-transactions",
    title: t("sidebar.transactions"),
    subtitle: "Financial transaction logs",
    icon: <CreditCard size={20} />,
    link: "/inventory/billing/transactions",
    type: "page",
    keywords: ["payments", "cash", "bank", "audit", "money move"]
  },
  {
    id: "nav-documents",
    title: t("sidebar.documents"),
    subtitle: "Upload and manage business documents",
    icon: <Files size={20} />,
    link: "/inventory/documents",
    type: "page",
    keywords: ["files", "uploads", "contracts", "records", "pdf"]
  },
  {
    id: "nav-logs",
    title: t("sidebar.logsAndAudits"),
    subtitle: "System audit trails and logs",
    icon: <History size={20} />,
    link: "/inventory/logs",
    type: "page",
    keywords: ["security", "audit", "tracking", "history", "actions"]
  },
];
