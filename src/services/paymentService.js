import apiClient from "@/lib/apiClient";

/**
 * Get all payments for a specific company
 * @param {string} companyId - The company ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Company payments data
 */
export const getCompanyPayments = async (companyId, options = {}) => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    return await apiClient.get(`/payment/company/${companyId}`, options);
  } catch (error) {
    console.error('Error fetching company payments:', error);
    throw error;
  }
};

/**
 * Get all payments for a specific seller
 * @param {string} sellerId - The seller ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Seller payments data
 */
export const getSellerPayments = async (sellerId, options = {}) => {
  if (!sellerId) {
    throw new Error('Seller ID is required');
  }

  try {
    return await apiClient.get(`/payment/seller/${sellerId}`, options);
  } catch (error) {
    console.error('Error fetching seller payments:', error);
    throw error;
  }
};

/**
 * Get all payments for a specific shop
 * @param {string} shopId - The shop ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Shop payments data
 */
export const getShopPayments = async (shopId, options = {}) => {
  if (!shopId) {
    throw new Error('Shop ID is required');
  }

  try {
    return await apiClient.get(`/payment/shop/${shopId}`, options);
  } catch (error) {
    console.error('Error fetching shop payments:', error);
    throw error;
  }
};

/**
 * Get payment status
 * @param {string} paymentId - The payment ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Payment status data
 */
export const getPaymentStatus = async (paymentId, options = {}) => {
  if (!paymentId) {
    throw new Error('Payment ID is required');
  }

  try {
    return await apiClient.get(`/payment/status/${paymentId}`, options);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

/**
 * Get payment statistics
 * @param {object} options - Request options
 * @returns {Promise<object>} Payment statistics data
 */
export const getPaymentStats = async (options = {}) => {
  try {
    return await apiClient.get('/payment/reports/stats', options);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

/**
 * Get gateway performance metrics
 * @param {object} options - Request options
 * @returns {Promise<object>} Gateway performance data
 */
export const getGatewayPerformance = async (options = {}) => {
  try {
    return await apiClient.get('/payment/reports/gateway-performance', options);
  } catch (error) {
    console.error('Error fetching gateway performance:', error);
    throw error;
  }
};

/**
 * Get payment trends
 * @param {object} params - Query parameters (startDate, endDate, interval)
 * @param {object} options - Request options
 * @returns {Promise<object>} Payment trends data
 */
export const getPaymentTrends = async (params = {}, options = {}) => {
  try {
    return await apiClient.get('/payment/reports/trends', { params, ...options });
  } catch (error) {
    console.error('Error fetching payment trends:', error);
    throw error;
  }
};

/**
 * Get revenue summary
 * @param {object} options - Request options
 * @returns {Promise<object>} Revenue summary data
 */
export const getRevenueSummary = async (options = {}) => {
  try {
    return await apiClient.get('/payment/reports/revenue-summary', options);
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    throw error;
  }
};

/**
 * Get company transactions
 * @param {string} companyId - The company ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Company transactions data
 */
export const getCompanyTransactions = async (companyId, options = {}) => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    return await apiClient.get(`/payment/transactions/company/${companyId}`, options);
  } catch (error) {
    console.error('Error fetching company transactions:', error);
    throw error;
  }
};

/**
 * Get company analytics
 * @param {string} companyId - The company ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Company analytics data
 */
export const getCompanyAnalytics = async (companyId, options = {}) => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    return await apiClient.get(`/payment/reports/company/${companyId}/analytics`, options);
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    throw error;
  }
};

/**
 * Get dashboard charts data
 * @param {object} options - Request options
 * @returns {Promise<object>} Dashboard charts data
 */
export const getDashboardCharts = async (options = {}) => {
  try {
    return await apiClient.get('/payment/reports/charts/dashboard', options);
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    throw error;
  }
};

/**
 * Get company invoices
 * @param {string} companyId - The company ID
 * @param {object} options - Request options
 * @returns {Promise<object>} Company invoices data
 */
export const getCompanyInvoices = async (companyId, options = {}) => {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    return await apiClient.get(`/payment/invoices/company/${companyId}`, options);
  } catch (error) {
    console.error('Error fetching company invoices:', error);
    throw error;
  }
};

