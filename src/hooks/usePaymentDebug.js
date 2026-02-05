// src/hooks/usePaymentDebug.js
// Hook for debugging payment APIs with console logging before making actual calls

import { useCallback } from 'react';

/**
 * Lazy load PAYMENT_URLS only when needed on client
 */
const getPaymentUrls = () => {
  try {
    const paymentModule = require('@/lib/api/paymentUrls');
    return paymentModule.default || {};
  } catch (error) {
    console.warn('Could not load payment URLs:', error);
    return {};
  }
};

/**
 * Custom hook for debugging payment API calls
 * Logs data structures before making actual API requests
 */
export const usePaymentDebug = () => {
  /**
   * Log a specific payment endpoint configuration
   * @param {string} endpoint - The endpoint name from PAYMENT_URLS
   * @param {string} id - Optional ID for dynamic endpoints (sellerId, shopId, etc.)
   */
  const inspectEndpoint = useCallback((endpoint, id = null) => {
    const PAYMENT_URLS = getPaymentUrls();
    console.group(`🔍 Inspecting Endpoint: ${endpoint}`);

    const route = PAYMENT_URLS[endpoint];

    if (!route) {
      console.warn(`Endpoint "${endpoint}" not found`);
      console.groupEnd();
      return;
    }

    console.log('📌 Configuration:');
    console.log({
      description: route.description,
      method: route.method,
      url: typeof route.url === 'function' ? route.url(id || 'PLACEHOLDER') : route.url,
      dynamicUrl: typeof route.url === 'function'
    });

    if (route.sampleData) {
      console.log('📨 Sample Request Payload:', route.sampleData);
    }

    if (route.sampleUrl) {
      console.log('🔗 Sample URL:', route.sampleUrl);
    }

    if (route.expectedResponse) {
      console.log('📤 Expected Response Structure:', route.expectedResponse);
    }

    console.groupEnd();
  }, []);

  /**
   * Log all available endpoints in a category
   * @param {string} category - Category name (e.g., 'reports', 'invoices')
   */
  const inspectCategory = useCallback((category) => {
    const PAYMENT_URLS = getPaymentUrls();
    const categoryData = PAYMENT_URLS[category];

    if (!categoryData) {
      console.warn(`Category "${category}" not found`);
      return;
    }

    console.group(`📚 Category: ${category}`);

    if (typeof categoryData === 'object' && !categoryData.url) {
      // It's a nested category
      Object.entries(categoryData).forEach(([key, route]) => {
        console.log(`\n  🔹 ${key}:`);
        console.log({
          description: route.description,
          method: route.method,
          url: typeof route.url === 'function' ? route.url('ID') : route.url
        });
      });
    } else {
      // It's a single route
      console.log(categoryData);
    }

    console.groupEnd();
  }, []);

  /**
   * Mock an API call - logs the request without making it
   * Useful for understanding data flow
   * @param {string} endpoint - Endpoint name
   * @param {string} id - Optional ID parameter
   * @param {object} payload - Optional request payload
   */
  const mockApiCall = useCallback((endpoint, id = null, payload = null) => {
    const PAYMENT_URLS = getPaymentUrls();
    console.group(`🎭 Mock API Call: ${endpoint}`);

    const route = PAYMENT_URLS[endpoint];
    const url = typeof route.url === 'function' ? route.url(id) : route.url;

    console.log({
      timestamp: new Date().toISOString(),
      method: route.method,
      url: url,
      payload: payload || route.sampleData || null
    });

    console.log('Expected Response Structure:', route.expectedResponse || 'TBD');
    console.groupEnd();

    // Return mock data structure
    return {
      method: route.method,
      url: url,
      payload: payload || route.sampleData,
      expectedResponse: route.expectedResponse
    };
  }, []);

  /**
   * Get the actual URL for an endpoint
   * @param {string} endpoint - Endpoint name
   * @param {string} id - Optional ID parameter
   * @returns {string} The full URL
   */
  const getEndpointUrl = useCallback((endpoint, id = null) => {
    const PAYMENT_URLS = getPaymentUrls();
    const route = PAYMENT_URLS[endpoint];
    if (!route) return null;
    return typeof route.url === 'function' ? route.url(id) : route.url;
  }, []);

  /**
   * Log summary of all payment endpoints grouped by type
   */
  const logEndpointsSummary = useCallback(() => {
    const PAYMENT_URLS = getPaymentUrls();
    console.group('📋 Payment Endpoints Summary');

    const categories = {
      'Payment Management': ['initiatePayment', 'getPaymentStatus', 'cancelPayment'],
      'Payment Queries': ['getSellerPayments', 'getCompanyPayments', 'getShopPayments'],
      'Transactions': ['getSellerTransactions', 'getCompanyTransactions', 'getShopTransactions'],
      'Reporting': ['reports'],
      'Invoices': ['invoices'],
      'Webhooks': ['webhooks']
    };

    Object.entries(categories).forEach(([category, endpoints]) => {
      console.group(`📌 ${category}`);
      endpoints.forEach(endpoint => {
        const route = PAYMENT_URLS[endpoint];
        if (route && route.url && typeof route.url !== 'function') {
          console.log(`  ${endpoint}: ${route.url}`);
        }
      });
      console.groupEnd();
    });

    console.groupEnd();
  }, []);

  return {
    inspectEndpoint,
    inspectCategory,
    mockApiCall,
    getEndpointUrl,
    logEndpointsSummary
  };
};

export default usePaymentDebug;
