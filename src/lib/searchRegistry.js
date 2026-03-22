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
 * Multilingual keywords added for Kinyarwanda, Swahili, and French support.
 */
export const getSearchablePages = (t) => [
  {
    id: "nav-dashboard",
    title: t("sidebar.dashboard"),
    subtitle: "Overview of your business metrics",
    icon: <LayoutDashboard size={20} />,
    link: "/inventory/dashboard",
    type: "page",
    keywords: ["home", "main", "overview", "stats", "ikubitiro", "incamake", "tableau de bord"]
  },
  {
    id: "nav-notifications",
    title: t("sidebar.notifications"),
    subtitle: "Recent alerts and updates",
    icon: <Bell size={20} />,
    link: "/inventory/notifications",
    type: "page",
    keywords: ["alerts", "messages", "inbox", "imenyesha", "ubutumwa", "notifications"]
  },
  {
    id: "nav-reports",
    title: t("sidebar.reports"),
    subtitle: "Detailed analytics and insights",
    icon: <BarChart3 size={20} />,
    link: "/inventory/reports",
    type: "page",
    keywords: ["analytics", "charts", "data", "marapororo", "ingere", "rapports", "ripoti"]
  },
  {
    id: "nav-workers",
    title: t("sidebar.staffList"),
    subtitle: "Manage your employees and workers",
    icon: <Users size={20} />,
    link: "/inventory/workers/list",
    type: "page",
    keywords: ["staff", "employees", "team", "abakozi", "abakozi bacu", "personnel", "wafanyakazi"]
  },
  {
    id: "nav-shops",
    title: t("sidebar.shops"),
    subtitle: "View and manage all company branches",
    icon: <Database size={20} />,
    link: "/inventory/companies",
    type: "page",
    keywords: ["branches", "locations", "amaduka", "amashami", "duka", "magasins", "maduka"]
  },
  {
    id: "nav-categories",
    title: t("categories.list.title"),
    subtitle: "Product categories management",
    icon: <Tags size={20} />,
    link: "/inventory/categories",
    type: "page",
    keywords: ["groups", "types", "ibyiciro", "amatsinda", "catégories"]
  },
  {
    id: "nav-products",
    title: t("sidebar.products"),
    subtitle: "Full product inventory",
    icon: <Package size={20} />,
    link: "/inventory/products",
    type: "page",
    keywords: ["inventory", "items", "stock", "ibicuruzwa", "ibikoresho", "isitoke", "produits", "bidhaa"]
  },
  {
    id: "nav-transfers",
    title: t("sidebar.transfers"),
    subtitle: "Manage inventory transfers between shops",
    icon: <Truck size={20} />,
    link: "/inventory/transfer",
    type: "page",
    keywords: ["moving", "shipping", "kwimura", "kohereza", "transferts"]
  },
  {
    id: "nav-stock",
    title: t("sidebar.stockOps"),
    subtitle: "Adjust and monitor stock levels",
    icon: <Database size={20} />,
    link: "/inventory/stock",
    type: "page",
    keywords: ["inventory", "levels", "stock", "isitoke", "ububiko"]
  },
  {
    id: "nav-sales-history",
    title: t("sidebar.salesHistory"),
    subtitle: "View past sales and transactions",
    icon: <History size={20} />,
    link: "/inventory/sales/history",
    type: "page",
    keywords: ["receipts", "past orders", "igurisha", "amateka y'igurisha", "ventes", "mauzo"]
  },
  {
    id: "nav-pos",
    title: t("sidebar.stockOut"),
    subtitle: "Point of Sale - Sell products",
    icon: <ShoppingBag size={20} />,
    link: "/inventory/sales/sellProduct/sale",
    type: "page",
    keywords: ["pos", "selling", "checkout", "kugurisha", "kwirukanira", "caisse"]
  },
  {
    id: "nav-debts",
    title: t("sidebar.debts"),
    subtitle: "Track customer balances and payments",
    icon: <Wallet size={20} />,
    link: "/inventory/debts",
    type: "page",
    keywords: ["money", "unpaid", "imyenda", "ibirarane", "amadeni", "dettes", "madeni"]
  },
  {
    id: "nav-invoices",
    title: t("sidebar.invoices"),
    subtitle: "Manage and generate billing invoices",
    icon: <FileSearch size={20} />,
    link: "/inventory/billing/invoices",
    type: "page",
    keywords: ["billing", "paperwork", "fagitire", "inyandiko", "factures"]
  },
  {
    id: "nav-transactions",
    title: t("sidebar.transactions"),
    subtitle: "Financial transaction logs",
    icon: <CreditCard size={20} />,
    link: "/inventory/billing/transactions",
    type: "page",
    keywords: ["payments", "cash", "amafaranga", "ihererekanya", "transactions"]
  },
  {
    id: "nav-documents",
    title: t("sidebar.documents"),
    subtitle: "Upload and manage business documents",
    icon: <Files size={20} />,
    link: "/inventory/documents",
    type: "page",
    keywords: ["files", "uploads", "inyandiko", "idokima", "documents"]
  },
  {
    id: "nav-logs",
    title: t("sidebar.logsAndAudits"),
    subtitle: "System audit trails and logs",
    icon: <History size={20} />,
    link: "/inventory/logs",
    type: "page",
    keywords: ["security", "audit", "ibikorwa", "isuzuma", "journaux"]
  },
];
