/**
 * Barrel File Optimization Guide
 * 
 * Barrel files (index.js) can slow down compilation if they import/export many heavy components.
 * This file shows optimized patterns.
 */

// ❌ SLOW: This imports all dependencies even if only one is used
// export { default as Component1 } from './Component1'; // 500KB
// export { default as Component2 } from './Component2'; // 500KB
// export { default as Component3 } from './Component3'; // 500KB
// export { default as Component4 } from './Component4'; // 500KB

// ✅ FAST: Lazy exports - components only loaded when imported
// Used like: const Component1 = lazy(() => import('@components/inventory/Component1'));

// For inventory discounts
export const DiscountCard = null; // Import directly when needed
export const DiscountFormModal = null;

// For inventory stock
export const StockLookup = null;
export const StockOperationForm = null;
export const BulkStockForm = null;
export const StockHistoryTable = null;

// For inventory alerts
export const AlertsList = null;
export const AlertSettingsModal = null;

// For inventory shop
export const ShopInventoryCard = null;
export const ShopInventoryFormModal = null;

/**
 * OPTIMIZATION TIP:
 * 
 * Instead of using barrel files with many exports, consider:
 * 
 * 1. Direct imports:
 *    import StockLookup from '@components/inventory/stock/StockLookup';
 * 
 * 2. Lazy imports (for heavy components):
 *    const StockLookup = lazy(() => import('@components/inventory/stock/StockLookup'));
 * 
 * 3. Tree-shaking friendly:
 *    // In next.config.mjs: optimizePackageImports will handle this
 * 
 * Barrel files are still useful for:
 * - UI component libraries (@mui/material uses them)
 * - Constants and utilities
 * - Re-exporting from multiple folders
 * 
 * But avoid them for:
 * - Heavy application components
 * - Components only used in one place
 * - Large business logic modules
 */
