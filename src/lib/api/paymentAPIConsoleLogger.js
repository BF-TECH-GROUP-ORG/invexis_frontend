/**
 * Payment API Console Logger
 * Displays formatted API responses in the browser console
 */

const COLORS = {
  primary: '#0284c7',      // Blue
  success: '#16a34a',      // Green
  warning: '#f59e0b',      // Orange
  danger: '#dc2626',       // Red
  info: '#06b6d4',         // Cyan
  secondary: '#8b5cf6',    // Purple
  dark: '#1f2937',         // Dark Gray
};

class PaymentAPIConsoleLogger {
  constructor() {
    this.requestCount = 0;
    this.responseCount = 0;
    this.errors = [];
  }

  /**
   * Log API request
   */
  logRequest(endpoint, method, path, data = null) {
    this.requestCount++;
    const requestNum = this.requestCount;

    console.log(
      `%c[REQUEST #${requestNum}] %c${method} %c${path}`,
      `color: ${COLORS.info}; font-weight: bold;`,
      `color: ${COLORS.warning}; font-weight: bold; font-family: monospace;`,
      `color: ${COLORS.success}; font-family: monospace;`
    );

    if (data) {
      console.log('%cPayload:', `color: ${COLORS.dark}; font-weight: bold;`);
      console.table(data);
    }

    return requestNum;
  }

  /**
   * Log API response
   */
  logResponse(requestNum, statusCode, responseData) {
    this.responseCount++;

    const statusColor = statusCode >= 200 && statusCode < 300 ? COLORS.success : COLORS.danger;
    const statusText = statusCode >= 200 && statusCode < 300 ? 'SUCCESS' : 'ERROR';

    console.log(
      `%c[RESPONSE #${requestNum}] %c${statusCode} ${statusText}`,
      `color: ${statusColor}; font-weight: bold;`,
      `color: ${statusColor}; font-weight: bold;`
    );

    console.log('%cResponse Data:', `color: ${COLORS.dark}; font-weight: bold;`);
    console.log(responseData);
    console.log('');
  }

  /**
   * Log payment summary
   */
  logPaymentSummary(paymentData) {
    if (!paymentData) return;

    console.log(
      '%c╔════════════════════════════════════════════════════════╗',
      `color: ${COLORS.primary}; font-size: 12px;`
    );
    console.log(
      `%c║          PAYMENT DATA SUMMARY                         ║`,
      `color: ${COLORS.primary}; font-size: 13px; font-weight: bold;`
    );
    console.log(
      '%c╚════════════════════════════════════════════════════════╝',
      `color: ${COLORS.primary}; font-size: 12px;`
    );

    const summary = {
      'Seller ID': paymentData.sellerId || 'N/A',
      'Total Payments': paymentData.totalPayments || 0,
      'Total Amount': paymentData.totalAmount || 0,
      'Currency': paymentData.currency || 'N/A',
      'Payment Records': paymentData.payments?.length || 0,
    };

    console.table(summary);

    if (paymentData.payments && paymentData.payments.length > 0) {
      console.log('%cPayment Details:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
      console.table(paymentData.payments);

      // Status breakdown
      const statusBreakdown = {};
      const methodBreakdown = {};

      paymentData.payments.forEach((payment) => {
        statusBreakdown[payment.status] = (statusBreakdown[payment.status] || 0) + 1;
        methodBreakdown[payment.paymentMethod] = (methodBreakdown[payment.paymentMethod] || 0) + 1;
      });

      console.log('%cStatus Breakdown:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
      console.table(statusBreakdown);

      console.log('%cPayment Methods Breakdown:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
      console.table(methodBreakdown);
    }

    console.log('');
  }

  /**
   * Log transaction summary
   */
  logTransactionSummary(transactionData) {
    if (!transactionData) return;

    console.log(
      '%c╔════════════════════════════════════════════════════════╗',
      `color: ${COLORS.secondary}; font-size: 12px;`
    );
    console.log(
      `%c║        TRANSACTION DATA SUMMARY                       ║`,
      `color: ${COLORS.secondary}; font-size: 13px; font-weight: bold;`
    );
    console.log(
      '%c╚════════════════════════════════════════════════════════╝',
      `color: ${COLORS.secondary}; font-size: 12px;`
    );

    const summary = {
      'Entity ID': transactionData.sellerId || transactionData.companyId || transactionData.shopId || 'N/A',
      'Total Transactions': transactionData.totalTransactions || 0,
      'Total Amount': transactionData.totalAmount || 0,
      'Transaction Records': transactionData.transactions?.length || 0,
    };

    console.table(summary);

    if (transactionData.transactions && transactionData.transactions.length > 0) {
      console.log('%cTransaction Details:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
      console.table(transactionData.transactions);
    }

    console.log('');
  }

  /**
   * Log invoice summary
   */
  logInvoiceSummary(invoiceData) {
    if (!invoiceData) return;

    console.log(
      '%c╔════════════════════════════════════════════════════════╗',
      `color: ${COLORS.warning}; font-size: 12px;`
    );
    console.log(
      `%c║           INVOICE DATA SUMMARY                        ║`,
      `color: ${COLORS.warning}; font-size: 13px; font-weight: bold;`
    );
    console.log(
      '%c╚════════════════════════════════════════════════════════╝',
      `color: ${COLORS.warning}; font-size: 12px;`
    );

    if (invoiceData.invoiceId) {
      // Single invoice
      console.log('%cInvoice Details:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
      console.log({
        'Invoice ID': invoiceData.invoiceId,
        'Amount': invoiceData.amount,
        'Currency': invoiceData.currency,
        'Status': invoiceData.status,
        'Created': invoiceData.createdAt,
      });

      if (invoiceData.items && invoiceData.items.length > 0) {
        console.log('%cInvoice Items:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
        console.table(invoiceData.items);
      }
    } else {
      // Multiple invoices
      const summary = {
        'Entity ID': invoiceData.sellerId || invoiceData.companyId || invoiceData.shopId || 'N/A',
        'Total Invoices': invoiceData.totalInvoices || 0,
        'Total Amount': invoiceData.totalAmount || 0,
        'Invoice Records': invoiceData.invoices?.length || 0,
      };
      console.table(summary);

      if (invoiceData.invoices && invoiceData.invoices.length > 0) {
        console.log('%cInvoice Details:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
        console.table(invoiceData.invoices);
      }
    }

    console.log('');
  }

  /**
   * Log reporting data
   */
  logReportingData(reportName, reportData) {
    if (!reportData) return;

    console.log(
      '%c╔════════════════════════════════════════════════════════╗',
      `color: ${COLORS.info}; font-size: 12px;`
    );
    console.log(
      `%c║           ${reportName.toUpperCase().padEnd(50)} ║`,
      `color: ${COLORS.info}; font-size: 13px; font-weight: bold;`
    );
    console.log(
      '%c╚════════════════════════════════════════════════════════╝',
      `color: ${COLORS.info}; font-size: 12px;`
    );

    console.log('%cReport Data:', `color: ${COLORS.dark}; font-weight: bold; font-size: 12px;`);
    console.log(reportData);

    console.log('');
  }

  /**
   * Log error
   */
  logError(endpoint, error) {
    this.errors.push({ endpoint, error, timestamp: new Date().toISOString() });

    console.error(
      `%c[ERROR] %c${endpoint}`,
      `color: ${COLORS.danger}; font-weight: bold;`,
      `color: ${COLORS.danger}; font-family: monospace;`
    );
    console.error(error);
    console.log('');
  }

  /**
   * Log API statistics
   */
  logStatistics() {
    console.log(
      '%c╔════════════════════════════════════════════════════════╗',
      `color: ${COLORS.dark}; font-size: 12px;`
    );
    console.log(
      `%c║           API STATISTICS                              ║`,
      `color: ${COLORS.dark}; font-size: 13px; font-weight: bold;`
    );
    console.log(
      '%c╚════════════════════════════════════════════════════════╝',
      `color: ${COLORS.dark}; font-size: 12px;`
    );

    console.table({
      'Total Requests': this.requestCount,
      'Total Responses': this.responseCount,
      'Total Errors': this.errors.length,
      'Success Rate': this.requestCount > 0 ? `${((this.responseCount / this.requestCount) * 100).toFixed(1)}%` : 'N/A',
    });

    if (this.errors.length > 0) {
      console.log('%cErrors:', `color: ${COLORS.danger}; font-weight: bold; font-size: 12px;`);
      console.table(this.errors);
    }

    console.log('');
  }

  /**
   * Reset statistics
   */
  reset() {
    this.requestCount = 0;
    this.responseCount = 0;
    this.errors = [];
    console.log('%cConsole logger reset', `color: ${COLORS.success}; font-weight: bold;`);
  }
}

// Create singleton instance
const paymentAPILogger = new PaymentAPIConsoleLogger();

export default paymentAPILogger;

/**
 * Helper function for quick logging
 */
export const logPaymentAPI = {
  payment: (data) => paymentAPILogger.logPaymentSummary(data),
  transaction: (data) => paymentAPILogger.logTransactionSummary(data),
  invoice: (data) => paymentAPILogger.logInvoiceSummary(data),
  report: (name, data) => paymentAPILogger.logReportingData(name, data),
  error: (endpoint, error) => paymentAPILogger.logError(endpoint, error),
  stats: () => paymentAPILogger.logStatistics(),
  reset: () => paymentAPILogger.reset(),
};
