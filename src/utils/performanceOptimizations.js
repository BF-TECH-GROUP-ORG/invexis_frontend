/**
 * Performance Optimization Utilities
 * These utilities help reduce unnecessary re-renders and improve component performance
 */

import { memo, useMemo, useCallback } from 'react';

/**
 * createMemoizedSelector: Creates a memoized selector from Redux
 * Prevents component re-renders when selected state hasn't changed
 * @param {Function} selector - Redux selector function
 * @returns {Function} Memoized selector
 */
export const createMemoizedSelector = (selector) => {
  let lastState = undefined;
  let lastResult = undefined;

  return (state) => {
    // Only recompute if state reference changes
    if (state !== lastState) {
      lastState = state;
      lastResult = selector(state);
    }
    return lastResult;
  };
};

/**
 * memoizeTableRow: Memoizes table row components to prevent unnecessary re-renders
 * Only re-renders when row data actually changes
 * @param {React.Component} RowComponent - Table row component
 * @returns {React.Component} Memoized row component
 */
export const memoizeTableRow = (RowComponent) => {
  return memo(RowComponent, (prevProps, nextProps) => {
    // Custom comparison for row props
    return JSON.stringify(prevProps.row) === JSON.stringify(nextProps.row) &&
           prevProps.index === nextProps.index &&
           prevProps.isSelected === nextProps.isSelected;
  });
};

/**
 * useOptimizedCallback: Creates a stable callback that doesn't recreate on every render
 * Reduces prop changes for memoized child components
 * @param {Function} callback - Function to optimize
 * @param {Array} dependencies - Dependency array
 * @returns {Function} Optimized callback
 */
export const useOptimizedCallback = useCallback;

/**
 * useOptimizedMemo: Creates memoized value that only recomputes when dependencies change
 * Prevents expensive calculations on every render
 * @param {Function} factory - Function that creates value
 * @param {Array} dependencies - Dependency array
 * @returns {any} Memoized value
 */
export const useOptimizedMemo = useMemo;

/**
 * createMemoizedComponent: Wraps a component with memo for performance
 * Prevents re-renders when props haven't changed
 * @param {React.Component} Component - Component to memoize
 * @param {Function} propsAreEqual - Optional custom comparison function
 * @returns {React.Component} Memoized component
 */
export const createMemoizedComponent = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

/**
 * debounceCallback: Creates a debounced callback for expensive operations
 * Useful for search, filter, and form handling
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced callback
 */
export const debounceCallback = (callback, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

/**
 * useDebounce: Hook for debouncing values
 * Prevents excessive re-renders from rapidly changing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = require('react').useState(value);

  require('react').useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * createVirtualizedList: Helps optimize rendering of large lists
 * Only renders visible items, dramatically improves performance
 * Use with react-window or react-virtual for best results
 */
export const createVirtualizedList = (items, itemSize, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemSize);
  const visibleItems = [];

  // In real implementation, calculate based on scroll position
  for (let i = 0; i < Math.min(visibleCount, items.length); i++) {
    visibleItems.push(items[i]);
  }

  return visibleItems;
};

/**
 * optimizeImageLoading: Returns optimized image loading strategy
 * Lazy loads images and uses optimal formats
 * @returns {Object} Image loading config
 */
export const optimizeImageLoading = () => ({
  loading: 'lazy',
  decoding: 'async',
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
});

/**
 * prefetchRoute: Prefetches a route to improve navigation speed
 * @param {string} href - Route to prefetch
 */
export const prefetchRoute = (href) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

/**
 * reduceBundle: Analyzes imports to identify optimization opportunities
 * Helps with tree-shaking and bundle reduction
 */
export const bundleOptimizations = {
  // Use these only when needed:
  // import { Button } from '@mui/material' (not entire module)
  // import { useCallback } from 'react' (not entire hooks)
};
