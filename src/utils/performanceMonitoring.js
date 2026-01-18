/**
 * Performance Monitoring and Metrics
 * Tracks compilation, rendering, and response times
 */

// Development-only performance logging
const isDev = process.env.NODE_ENV === 'development';

/**
 * Logs performance metrics to help identify bottlenecks
 * @param {string} name - Metric name
 * @param {number} duration - Duration in milliseconds
 */
export const logPerformanceMetric = (name, duration) => {
  if (isDev && duration > 100) {
    console.warn(`⚠️ Performance: ${name} took ${duration.toFixed(2)}ms`);
  } else if (isDev) {
    console.log(`✅ Performance: ${name} - ${duration.toFixed(2)}ms`);
  }
};

/**
 * Measures execution time of async functions
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Async function to measure
 */
export const measureAsync = async (label, fn) => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    logPerformanceMetric(label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Performance: ${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Measures execution time of sync functions
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Sync function to measure
 */
export const measureSync = (label, fn) => {
  const startTime = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    logPerformanceMetric(label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ Performance: ${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Monitors Web Vitals (Core Web Vitals)
 * LCP: Largest Contentful Paint
 * FID: First Input Delay
 * CLS: Cumulative Layout Shift
 */
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Report LCP
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        logPerformanceMetric('LCP (Largest Contentful Paint)', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silently fail if API not available
    }
  }
};

/**
 * Gets a summary of current performance metrics
 * Useful for debugging performance issues
 */
export const getPerformanceSummary = () => {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation) return null;

  return {
    DNS: (navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2),
    TCP: (navigation.connectEnd - navigation.connectStart).toFixed(2),
    'Request Time': (navigation.responseStart - navigation.requestStart).toFixed(2),
    'Response Time': (navigation.responseEnd - navigation.responseStart).toFixed(2),
    'DOM Interactive': (navigation.domInteractive - navigation.fetchStart).toFixed(2),
    'Page Load': (navigation.loadEventEnd - navigation.fetchStart).toFixed(2),
  };
};
