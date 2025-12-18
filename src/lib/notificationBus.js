/**
 * Simple global event bus for notifications
 */
const subscribers = new Set();

export const notificationBus = {
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  emit(notification) {
    subscribers.forEach((callback) => callback(notification));
  },

  success(message, duration = 10000) {
    this.emit({ message, severity: "success", duration });
  },

  error(message, duration = 10000) {
    this.emit({
      message: message || "An error occurred",
      severity: "error",
      duration,
    });
  },

  warning(message, duration = 10000) {
    this.emit({ message, severity: "warning", duration });
  },

  info(message, duration = 10000) {
    this.emit({ message, severity: "info", duration });
  },
};
