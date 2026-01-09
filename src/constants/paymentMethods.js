// Payment Methods Constants for Debt and Sales
// Backend values and display configurations

export const DEBT_PAYMENT_METHODS = {
  CASH: {
    id: "CASH",
    label: "Cash",
    icon: "💵",
    image: null,
    description: "Pay in cash",
    requiresPhone: false,
    backendValue: "CASH"
  },
  MTN: {
    id: "MTN",
    label: "MTN",
    icon: null,
    image: "https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg",
    description: "Pay via MTN Mobile Money",
    requiresPhone: true,
    backendValue: "MTN"
  },
  AIRTEL: {
    id: "AIRTEL",
    label: "Airtel",
    icon: null,
    image: "https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png",
    description: "Pay via Airtel Money",
    requiresPhone: true,
    backendValue: "AIRTEL"
  },
  MPESA: {
    id: "MPESA",
    label: "M-Pesa",
    icon: null,
    image: "https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png",
    description: "Pay via M-Pesa",
    requiresPhone: true,
    backendValue: "MPESA"
  },
  BANK_TRANSFER: {
    id: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: "🏦",
    image: null,
    description: "Pay via bank transfer",
    requiresPhone: false,
    backendValue: "BANK_TRANSFER"
  }
};

export const SALES_PAYMENT_METHODS = {
  cash: {
    id: "cash",
    label: "Cash",
    icon: "💵",
    image: null,
    description: "Pay in cash",
    requiresPhone: false,
    backendValue: "cash"
  },
  mtn: {
    id: "mtn",
    label: "MTN",
    icon: null,
    image: "https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg",
    description: "Pay via MTN Mobile Money",
    requiresPhone: true,
    backendValue: "mtn"
  },
  airtel: {
    id: "airtel",
    label: "Airtel",
    icon: null,
    image: "https://download.logo.wine/logo/Airtel_Uganda/Airtel_Uganda-Logo.wine.png",
    description: "Pay via Airtel Money",
    requiresPhone: true,
    backendValue: "airtel"
  },
  mpesa: {
    id: "mpesa",
    label: "M-Pesa",
    icon: null,
    image: "https://upload.wikimedia.org/wikipedia/commons/0/03/M-pesa-logo.png",
    description: "Pay via M-Pesa",
    requiresPhone: true,
    backendValue: "mpesa"
  },
  bank_transfer: {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: "🏦",
    image: null,
    description: "Pay via bank transfer",
    requiresPhone: false,
    backendValue: "bank_transfer"
  }
};

// Helper function to get all payment methods as array
export const getPaymentMethodsList = (type = "debt") => {
  const methods = type === "debt" ? DEBT_PAYMENT_METHODS : SALES_PAYMENT_METHODS;
  return Object.values(methods);
};

// Helper function to check if payment method requires phone
export const requiresPhone = (methodId, type = "debt") => {
  const methods = type === "debt" ? DEBT_PAYMENT_METHODS : SALES_PAYMENT_METHODS;
  return methods[methodId]?.requiresPhone || false;
};

// Get display label for a payment method
export const getPaymentMethodLabel = (methodId, type = "debt") => {
  const methods = type === "debt" ? DEBT_PAYMENT_METHODS : SALES_PAYMENT_METHODS;
  const method = Object.values(methods).find(m => m.id === methodId || m.id === methodId.toUpperCase());
  return method?.label || methodId;
};
