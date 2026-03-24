// Payment API console logger - disabled for production
class PaymentAPIConsoleLogger {
  logRequest() {}
  logResponse() {}
  logError() {}
}

const paymentLogger = new PaymentAPIConsoleLogger();
export { PaymentAPIConsoleLogger };
export default paymentLogger;
