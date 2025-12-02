const { default: axios } = require("axios");

const DEBT_API_URL = process.env.NEXT_PUBLIC_DEBT_API_URL;

// Get all debts for a company
export const getDebts = async (companyId) => {
    if (typeof companyId === 'object') {
        console.error("Invalid companyId passed to getDebts:", companyId);
        throw new Error("Invalid companyId: Object passed instead of string");
    }
    try {
        const response = await axios.get(`${DEBT_API_URL}/company/${companyId}/debts`, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debts fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching debts:", error);
        throw error;
    }
};

// Get a single debt by ID
export const getDebtById = async (debtId, companyId) => {
    try {
        const response = await axios.get(`${DEBT_API_URL}company/${companyId}/debts/${debtId}`, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching debt:", error);
        throw error;
    }
};

// Create a new debt
export const createDebt = async (debtData, companyId) => {
    try {
        const response = await axios.post(`${DEBT_API_URL}company/${companyId}/debts`, debtData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating debt:", error);
        throw error;
    }
};

// Update an existing debt
export const updateDebt = async (debtId, debtData, companyId) => {
    try {
        const response = await axios.patch(`${DEBT_API_URL}company/${companyId}/debts/${debtId}`, debtData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating debt:", error);
        throw error;
    }
};

// Delete a debt
export const deleteDebt = async (debtId, companyId) => {
    try {
        const response = await axios.delete(`${DEBT_API_URL}company/${companyId}/debts/${debtId}`, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt deleted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting debt:", error);
        throw error;
    }
};

// Record a payment/repayment for a debt
export const recordRepayment = async (repaymentData) => {
    try {
        const response = await axios.post(`${DEBT_API_URL}/repayment`, repaymentData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Repayment recorded:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error recording repayment:", error);
        throw error;
    }
};

// Mark debt as paid (creates repayment for remaining amount and marks PAID)
export const markDebtAsPaid = async (debtId, companyId, userId, userName) => {
    try {
        const payload = {
            companyId: companyId,
            paymentId: crypto.randomUUID(), // Generate unique payment ID
            paymentMethod: "CASH", // Default to CASH, can be customized
            paymentReference: `MARK-PAID-${Date.now()}`,
            createdBy: {
                id: userId || "temp-user-id",
                name: userName || "POS User"
            }
        };

        const response = await axios.post(`${DEBT_API_URL}/${debtId}/mark-paid`, payload, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt marked as paid:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error marking debt as paid:", error);
        throw error;
    }
};

// Cancel a debt (mark as CANCELLED)
export const cancelDebt = async (debtId, companyId, userId, userName, reason = "customer_requested_refund_or_writeoff") => {
    try {
        const payload = {
            companyId: companyId,
            reason: reason,
            performedBy: {
                id: userId || "temp-user-id",
                name: userName || "POS User"
            }
        };

        const response = await axios.post(`${DEBT_API_URL}/${debtId}/cancel`, payload, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Debt cancelled:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error cancelling debt:", error);
        throw error;
    }
};