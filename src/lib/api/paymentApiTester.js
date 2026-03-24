// src/lib/api/paymentApiTester.js
// Browser console utilities for testing payment APIs without making actual calls

/**
 * Lazy load PAYMENT_URLS only when needed
 */
const getPaymentUrls = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const paymentModule = require('./paymentUrls');
    return paymentModule.default || {};
  } catch (error) {
    console.warn('Could not load payment URLs:', error);
    return {};
  }
};

/**
 * Global payment API tester object
 * Access in browser console as: window.paymentTester
 */
export const createPaymentTester = () => {
  return {
    /**
     * List all available endpoints
     */
    listEndpoints() {
      const PAYMENT_URLS = getPaymentUrls();
      console.clear();
      console.group('📋 All Payment Endpoints');
      Object.entries(PAYMENT_URLS).forEach(([key, value]) => {
        if (typeof value === 'object' && value.url) {

        } else if (typeof value === 'object') {
          console.group(`📁 ${key}`);
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue.url) {
              const url = typeof subValue.url === 'function' ? subValue.url('ID') : subValue.url;

            }
          });
          console.groupEnd();
        }
      });
      console.groupEnd();
    },

    /**
     * Get details about a specific endpoint
     * Usage: paymentTester.endpoint('initiatePayment')
     */
    endpoint(name) {
      const PAYMENT_URLS = getPaymentUrls();
      console.clear();
      let route = PAYMENT_URLS[name];

      // Check nested routes
      if (!route) {
        for (const [category, endpoints] of Object.entries(PAYMENT_URLS)) {
          if (typeof endpoints === 'object' && endpoints[name]) {
            route = endpoints[name];
            break;
          }
        }
      }

      if (!route) {
        console.error(`❌ Endpoint "${name}" not found`);

        return;
      }

      console.group(`🔍 Endpoint: ${name}`);



      if (typeof route.url === 'function') {

      } else {

      }

      if (route.sampleData) {

      }

      if (route.sampleUrl) {

      }

      if (route.expectedResponse) {

      }

      if (route.secured) {

      }

      console.groupEnd();
    },

    /**
     * Generate a curl command for testing
     * Usage: paymentTester.curl('initiatePayment')
     */
    curl(endpoint, id = null) {
      const PAYMENT_URLS = getPaymentUrls();
      const route = PAYMENT_URLS[endpoint];
      if (!route) {
        console.error(`Endpoint "${endpoint}" not found`);
        return;
      }

      const url = typeof route.url === 'function' ? route.url(id) : route.url;
      const data = route.sampleData ? JSON.stringify(route.sampleData) : '';

      let curlCmd = `curl -X ${route.method} "${url}"`;

      if (route.method !== 'GET' && data) {
        curlCmd += `\n  -H "Content-Type: application/json"\n  -d '${data}'`;
      }




      // Also copy to clipboard
      navigator.clipboard.writeText(curlCmd).then(() => {

      });
    },

    /**
     * Test endpoint with mock data
     * Usage: paymentTester.test('initiatePayment', { amount: 50000 })
     */
    test(endpoint, customData = null) {
      const PAYMENT_URLS = getPaymentUrls();
      const route = PAYMENT_URLS[endpoint];
      if (!route) {
        console.error(`Endpoint "${endpoint}" not found`);
        return;
      }

      const payload = customData || route.sampleData;
      const timestamp = new Date().toISOString();

      console.group(`🎭 Test: ${endpoint}`);




      if (payload) {

      }






      console.groupEnd();

      return {
        method: route.method,
        payload: payload,
        expectedResponse: route.expectedResponse
      };
    },

    /**
     * Make an actual fetch call
     * Usage: await paymentTester.fetch('initiatePayment', 'id', { amount: 50000 })
     */
    async fetch(endpoint, id = null, customData = null) {
      const PAYMENT_URLS = getPaymentUrls();
      const route = PAYMENT_URLS[endpoint];
      if (!route) {
        console.error(`Endpoint "${endpoint}" not found`);
        return;
      }

      const url = typeof route.url === 'function' ? route.url(id) : route.url;
      const payload = customData || route.sampleData;

      console.group(`📡 Fetching: ${endpoint}`);



      try {
        const options = {
          method: route.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN'}`
          }
        };

        if (payload && route.method !== 'GET') {
          options.body = JSON.stringify(payload);
        }



        const response = await fetch(url, options);
        const data = await response.json();



        console.groupEnd();

        return data;
      } catch (error) {
        console.error('❌ Fetch Error:', error);
        console.groupEnd();
        throw error;
      }
    },

    /**
     * Compare expected vs actual response
     * Usage: paymentTester.compare('initiatePayment', actualData)
     */
    compare(endpoint, actualData) {
      const PAYMENT_URLS = getPaymentUrls();
      const route = PAYMENT_URLS[endpoint];
      if (!route || !route.expectedResponse) {
        console.error('Endpoint not found or has no expected response');
        return;
      }

      console.group(`📊 Compare: ${endpoint}`);



      // Basic structure comparison
      const expectedKeys = Object.keys(route.expectedResponse);
      const actualKeys = Object.keys(actualData);

      console.group('🔑 Key Comparison');



      const missing = expectedKeys.filter(k => !actualKeys.includes(k));
      const extra = actualKeys.filter(k => !expectedKeys.includes(k));

      if (missing.length > 0) console.warn('❌ Missing keys:', missing);
      if (extra.length > 0) console.info('ℹ️ Extra keys:', extra);

      console.groupEnd();
      console.groupEnd();
    },

    /**
     * Get full URL for an endpoint
     * Usage: paymentTester.url('getSellerPayments', 'seller_123')
     */
    url(endpoint, id = null) {
      const PAYMENT_URLS = getPaymentUrls();
      const route = PAYMENT_URLS[endpoint];
      if (!route) {
        console.error(`Endpoint "${endpoint}" not found`);
        return null;
      }

      return typeof route.url === 'function' ? route.url(id) : route.url;
    },

    /**
     * Help menu
     */
    help() {
      console.clear();
      console.group('%c💡 Payment API Tester - Help', 'font-size: 16px; font-weight: bold;');

📚 Available Commands:

paymentTester.listEndpoints()
  └─ List all available payment endpoints

paymentTester.endpoint(name)
  └─ Get details about a specific endpoint
  └─ Example: paymentTester.endpoint('initiatePayment')

paymentTester.curl(endpoint, id)
  └─ Generate CURL command for testing
  └─ Example: paymentTester.curl('getSellerPayments', 'seller_123')

paymentTester.test(endpoint, customData)
  └─ Test endpoint with mock data
  └─ Example: paymentTester.test('initiatePayment', { amount: 50000 })

paymentTester.fetch(endpoint, id, customData)
  └─ Make actual API call
  └─ Example: await paymentTester.fetch('getSellerPayments', 'seller_123')

paymentTester.compare(endpoint, actualData)
  └─ Compare expected vs actual response
  └─ Example: paymentTester.compare('initiatePayment', responseData)

paymentTester.url(endpoint, id)
  └─ Get full URL for an endpoint
  └─ Example: paymentTester.url('getSellerPayments', 'seller_123')

paymentTester.help()
  └─ Show this help menu

════════════════════════════════════════════════════════════════════════════════
      `);
      console.groupEnd();
    }
  };
};

// Initialize and expose globally for browser console
if (typeof window !== 'undefined') {
  window.paymentTester = createPaymentTester();

}

export default createPaymentTester;
