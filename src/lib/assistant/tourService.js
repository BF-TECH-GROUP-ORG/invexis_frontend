import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourMapping = {
  "/inventory/dashboard": {
    title: "Dashboard Mastery",
    path: "/inventory/dashboard",
    steps: [
      { element: "#sidebar-dashboard", popover: { title: "1. The Overview", description: "Monitor your total sales and profits in real-time." } },
    ]
  },
  "/inventory/notifications": {
    title: "Alerts & Announcements",
    path: "/inventory/notifications",
    steps: [
      { element: "#nav-notifications", popover: { title: "1. Notification Center", description: "Check here for stock alerts and company-wide announcements." } },
    ]
  },
  "/inventory/workers/list": {
    title: "Complete Staff Guide",
    path: "/inventory/workers/list",
    steps: [
      { element: "#sidebar-mgmt-staff", popover: { title: "1. Management Menu", description: "Open this to manage your human resources." } },
      { element: "#sidebar-staff-list", popover: { title: "2. Staff List", description: "Click here to see all registered employees." } },
      { element: "#add-worker-btn", popover: { title: "3. Registration", description: "Click this button to open the registration form for a new staff member." } },
    ]
  },
  "/inventory/categories": {
    title: "Category Organization",
    path: "/inventory/categories",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Section", description: "Access your product classification tools." } },
      { element: "#sidebar-categories", popover: { title: "2. Hierarchy Manager", description: "View your category structure." } },
      { element: "#add-category-btn", popover: { title: "3. Create New", description: "Start creating a new category level (1, 2, or 3)." } },
    ]
  },
  "/inventory/products": {
    title: "Product Lifecycle (0-100%)",
    path: "/inventory/products",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Open Inventory", description: "Access your catalog management." } },
      { element: "#sidebar-products", popover: { title: "2. Active Products", description: "Manage your existing stock items here." } },
      { element: "#add-product-btn", popover: { title: "3. Add New Item", description: "Launch the 7-step product wizard to add a new item to your shop." } },
    ]
  },
  "/inventory/sales/sellProduct/sale": {
    title: "Point of Sale Mastery",
    path: "/inventory/sales/sellProduct/sale",
    steps: [
      { element: "#sidebar-mgmt-sales", popover: { title: "1. Sales Operations", description: "Open for customer transactions." } },
      { element: "#sidebar-pos", popover: { title: "2. Stock-out Terminal", description: "Launch the POS terminal to record a customer purchase." } },
    ]
  },
  "/inventory/transfer": {
    title: "Stock Transfers",
    path: "/inventory/transfer",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Tools", description: "Open the management menu." } },
      { element: "#sidebar-transfers", popover: { title: "2. Transfer Log", description: "Move stock between branches or to partners." } },
    ]
  },
  "/inventory/debts": {
    title: "Financial Liabilities",
    path: "/inventory/debts",
    steps: [
      { element: "#sidebar-debts", popover: { title: "1. Debt Tracker", description: "Monitor money owed to you and repayment schedules." } },
    ]
  },
  "/inventory/billing/invoices": {
    title: "Invoice Management",
    path: "/inventory/billing/invoices",
    steps: [
      { element: "#sidebar-mgmt-billing", popover: { title: "1. Billing Hub", description: "Access financial documents." } },
      { element: "#sidebar-invoices", popover: { title: "2. Master Invoices", description: "Generate and track professional customer invoices." } },
    ]
  },
  "/inventory/logs": {
    title: "System Transparency",
    path: "/inventory/logs",
    steps: [
      { element: "#sidebar-logs", popover: { title: "1. Audit Trail", description: "For complete security, view every action performed by every user." } },
    ]
  }
};

/**
 * Wait for DOM to settle (adjustable delay)
 */
function waitForDOM(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait until a specific element appears in the DOM (with timeout)
 */
function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Filter steps based on current location (Smart Start)
 */
const getFilteredSteps = (path, currentPath) => {
  const tour = tourMapping[path];
  if (!tour) return [];

  if (currentPath.includes(path)) {
    const mainSteps = tour.steps.filter(step =>
      !step.element.includes("sidebar") &&
      !step.element.includes("nav-")
    );
    return mainSteps.length > 0 ? mainSteps : tour.steps;
  }

  return tour.steps;
};

export const TOUR_MAP = tourMapping;

/**
 * Maps natural language intent to a tour key from TOUR_MAP
 */
export function resolveTourKey(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  const intents = [
    { key: "/inventory/dashboard", keywords: ["dashboard", "overview", "stats", "kpi", "performance"] },
    { key: "/inventory/notifications", keywords: ["notification", "alert", "announcement", "message"] },
    { key: "/inventory/workers/list", keywords: ["staff", "worker", "employee", "team", "hire", "register staff"] },
    { key: "/inventory/categories", keywords: ["category", "categories", "hierarchy", "classification"] },
    { key: "/inventory/products", keywords: ["product", "item", "inventory", "catalog", "add item", "add product"] },
    { key: "/inventory/sales/sellProduct/sale", keywords: ["sale", "sell", "pos", "point of sale", "stock-out", "transaction"] },
    { key: "/inventory/transfer", keywords: ["transfer", "move stock", "send stock"] },
    { key: "/inventory/debts", keywords: ["debt", "receivable", "owe", "credit"] },
    { key: "/inventory/billing/invoices", keywords: ["invoice", "billing", "bill"] },
    { key: "/inventory/logs", keywords: ["log", "audit", "history", "activity"] },
  ];

  for (const intent of intents) {
    if (intent.keywords.some(kw => lower.includes(kw))) {
      return intent.key;
    }
  }

  return null;
}

export const startTour = async (path, onComplete, currentPath, navigate) => {
  const tour = tourMapping[path];
  if (!tour) {
    if (onComplete) onComplete();
    return;
  }

  // If the tour requires navigation first
  if (tour.path && !currentPath.includes(tour.path)) {
    navigate(tour.path);
    await waitForDOM(600); // Give page a moment to load
    await waitForElement(tour.steps[0].element, 3000);
  }

  const steps = getFilteredSteps(path, currentPath);

  if (!steps || steps.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  const driverObj = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.65,
    overlayColor: '#081422',
    stagePadding: 10,
    stageRadius: 10,
    popoverOffset: 12,
    popoverClass: 'inara-tour-popover',
    showProgress: true,
    progressText: 'Step {{current}} of {{total}}',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: '✅ Done',

    // ─── FIX: onNextClick for cross-page navigation ───
    onNextClick: async (element, step, opts) => {
      const nextIndex = opts.state.activeIndex + 1;

      if (nextIndex >= steps.length) {
        driverObj.destroy();
        return;
      }

      const nextStep = steps[nextIndex];
      let nextEl = document.querySelector(nextStep.element);

      if (!nextEl) {
        // If element is not in DOM, try clicking current element (maybe it opens a menu)
        const currentEl = document.querySelector(step.element);
        currentEl?.click();

        nextEl = await waitForElement(nextStep.element, 3000);
      }

      if (nextEl) {
        driverObj.moveNext();
      } else {
        // Fallback or give up if element never appears
        driverObj.destroy();
      }
    },

    onDestroyed: () => {
      if (onComplete) onComplete();
    }
  });

  driverObj.setSteps(steps);
  driverObj.drive();
};

export { tourMapping };
