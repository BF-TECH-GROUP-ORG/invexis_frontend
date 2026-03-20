import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourMapping = {
  "/inventory/dashboard": {
    title: "Dashboard Mastery",
    steps: [
      { element: "#sidebar-dashboard", popover: { title: "1. The Overview", description: "Monitor your total sales and profits in real-time." } },
    ]
  },
  "/inventory/notifications": {
    title: "Alerts & Announcements",
    steps: [
      { element: "#nav-notifications", popover: { title: "1. Notification Center", description: "Check here for stock alerts and company-wide announcements." } },
    ]
  },
  "/inventory/workers/list": {
    title: "Complete Staff Guide",
    steps: [
      { element: "#sidebar-mgmt-staff", popover: { title: "1. Management Menu", description: "Open this to manage your human resources." } },
      { element: "#sidebar-staff-list", popover: { title: "2. Staff List", description: "Click here to see all registered employees." } },
      { element: "#add-worker-btn", popover: { title: "3. Registration", description: "Click this button to open the registration form for a new staff member." } },
    ]
  },
  "/inventory/categories": {
    title: "Category Organization",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Section", description: "Access your product classification tools." } },
      { element: "#sidebar-categories", popover: { title: "2. Hierarchy Manager", description: "View your category structure." } },
      { element: "#add-category-btn", popover: { title: "3. Create New", description: "Start creating a new category level (1, 2, or 3)." } },
    ]
  },
  "/inventory/products": {
    title: "Product Lifecycle (0-100%)",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Open Inventory", description: "Access your catalog management." } },
      { element: "#sidebar-products", popover: { title: "2. Active Products", description: "Manage your existing stock items here." } },
      { element: "#add-product-btn", popover: { title: "3. Add New Item", description: "Launch the 7-step product wizard to add a new item to your shop." } },
    ]
  },
  "/inventory/sales/sellProduct/sale": {
    title: "Point of Sale Mastery",
    steps: [
      { element: "#sidebar-mgmt-sales", popover: { title: "1. Sales Operations", description: "Open for customer transactions." } },
      { element: "#sidebar-pos", popover: { title: "2. Stock-out Terminal", description: "Launch the POS terminal to record a customer purchase." } },
    ]
  },
  "/inventory/transfer": {
    title: "Stock Transfers",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Tools", description: "Open the management menu." } },
      { element: "#sidebar-transfers", popover: { title: "2. Transfer Log", description: "Move stock between branches or to partners." } },
    ]
  },
  "/inventory/debts": {
    title: "Financial Liabilities",
    steps: [
      { element: "#sidebar-debts", popover: { title: "1. Debt Tracker", description: "Monitor money owed to you and repayment schedules." } },
    ]
  },
  "/inventory/billing/invoices": {
    title: "Invoice Management",
    steps: [
      { element: "#sidebar-mgmt-billing", popover: { title: "1. Billing Hub", description: "Access financial documents." } },
      { element: "#sidebar-invoices", popover: { title: "2. Master Invoices", description: "Generate and track professional customer invoices." } },
    ]
  },
  "/inventory/logs": {
    title: "System Transparency",
    steps: [
      { element: "#sidebar-logs", popover: { title: "1. Audit Trail", description: "For complete security, view every action performed by every user." } },
    ]
  }
};

/**
 * Filter steps based on current location (Smart Start)
 */
const getFilteredSteps = (path, currentPath) => {
  const tour = tourMapping[path];
  if (!tour) return [];

  // If the user is ALREADY on the target page, we can optionally skip sidebar steps,
  // BUT only if there are enough other steps to show.
  if (currentPath.includes(path)) {
    const mainSteps = tour.steps.filter(step => 
        !step.element.includes("sidebar") && 
        !step.element.includes("nav-")
    );
    
    // If we have specific page steps, show them. Otherwise show all.
    return mainSteps.length > 0 ? mainSteps : tour.steps;
  }

  return tour.steps;
};

export const startTour = (path, onComplete, currentPath = "") => {
  const steps = getFilteredSteps(path, currentPath);
  
  if (!steps || steps.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "rgba(8, 20, 34, 0.85)",
    allowClose: true,
    stagePadding: 10,
    popoverClass: 'inara-tour-popover',
    onDestroyed: () => {
        if (onComplete) onComplete();
    }
  });

  driverObj.setSteps(steps);
  driverObj.drive();
};

export { tourMapping };
