import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const tourMapping = {
  "/inventory/dashboard": {
    title: "Dashboard Overview",
    steps: [
      { element: "#sidebar-toggle-btn", popover: { title: "1. Navigation Menu", description: "Use this button to expand or collapse your sidebar menu." } },
      { element: "#sidebar-dashboard", popover: { title: "2. The Command Center", description: "This is your main dashboard. It provides a bird's-eye view of your total sales, profit, and stock health." } },
    ]
  },
  "/inventory/notifications": {
    title: "Notifications Guide",
    steps: [
      { element: "#nav-notifications", popover: { title: "1. Stay Updated", description: "This bell icon pulses when you have low stock alerts or new system announcements. Don't miss them!" } },
    ]
  },
  "/inventory/products": {
    title: "Product Management Tour",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Menu", description: "First, we open the Inventory management section to find our tools." } },
      { element: "#sidebar-products", popover: { title: "2. Products List", description: "This is where the magic happens. You can add new products, manage variants (like size and color), and track stock levels." } },
    ]
  },
  "/inventory/categories": {
    title: "Categories Guide",
    steps: [
      { element: "#sidebar-mgmt-inventory", popover: { title: "1. Inventory Section", description: "We start by accessing your inventory organization tools." } },
      { element: "#sidebar-categories", popover: { title: "2. Master Categories", description: "Organize your products into a 3-level hierarchy for better reporting and filtering." } },
    ]
  },
  "/inventory/workers/list": {
    title: "Staff Management Tour",
    steps: [
      { element: "#sidebar-mgmt-staff", popover: { title: "1. Business Structure", description: "This section is for managing your organizational structure." } },
      { element: "#sidebar-staff-list", popover: { title: "2. Your Team", description: "Add new employees, assign them to specific shops, and manage their system permissions here." } },
    ]
  },
  "/inventory/sales/sellProduct/sale": {
    title: "POS Terminal Tour",
    steps: [
      { element: "#sidebar-mgmt-sales", popover: { title: "1. Sales Operations", description: "All customer-facing activities are grouped here." } },
      { element: "#sidebar-pos", popover: { title: "2. Stock-out (POS)", description: "This is the Point of Sale. Select products, scan barcodes, and process payments via Cash, MoMo, or Airtel." } },
    ]
  },
  "/profile": {
    title: "Profile & Settings",
    steps: [
      { element: "#nav-profile", popover: { title: "1. Account Access", description: "Click your avatar to access your personal settings and language preferences." } },
      { element: "#profile-info-section", popover: { title: "2. Identity", description: "Here you can see your current role and verified credentials." } },
      { element: "#language-switcher-section", popover: { title: "3. Multilingual Support", description: "Invexix supports English, French, Kinyarwanda, and Swahili. Switch anytime!" } },
    ]
  }
};

export const startTour = (path, onComplete) => {
  const tour = tourMapping[path];
  if (!tour) {
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

  driverObj.setSteps(tour.steps);
  driverObj.drive();
};

export { tourMapping };
