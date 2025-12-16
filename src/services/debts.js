import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const DEBT_API_URL = `/debt`;

/**
 * Get all debts for a company
 *
 * CACHING: Debts cached for 60-120 seconds (moderate frequency)
 * Per blueprint: debts query caching 60-120 seconds
 */
export const getDebts = async (companyId) => {
  if (typeof companyId === "object") {
    console.error("Invalid companyId passed to getDebts:", companyId);
    throw new Error("Invalid companyId: Object passed instead of string");
  }

  const cacheStrategy = getCacheStrategy("DEBTS", "LIST");

  try {
    const data = await apiClient.get(
      `${DEBT_API_URL}/company/${companyId}/debts`,
      {
        cache: cacheStrategy,
      }
    );
    console.log("Debts fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw error;
  }
};

/**
 * Get a single debt by ID
 *
 * CACHING: Individual debt cached for 60 seconds
 */
export const getDebtById = async (debtId, companyId) => {
  const cacheStrategy = getCacheStrategy("DEBTS", "DETAIL");

  try {
    const data = await apiClient.get(
      `${DEBT_API_URL}/company/${companyId}/debts/${debtId}`,
      {
        cache: cacheStrategy,
      }
    );
    console.log("Debt fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching debt:", error);
    throw error;
  }
};

/**
 * Create a new debt
 *
 * CACHING: POST never cached. Clears debts cache after creation.
 */
export const createDebt = async (debtData) => {
  try {
    const data = await apiClient.post(
      `${DEBT_API_URL}/create`,
      debtData
    );

    // Clear debts cache since we added new data
    apiClient.clearCache("/debts");

    console.log("Debt created:", data);
    return data;
  } catch (error) {
    console.error("Error creating debt:", error);
    throw error;
  }
};

/**
 * Update an existing debt
 *
 * CACHING: PATCH never cached. Clears debts cache.
 */
export const updateDebt = async (debtId, debtData, companyId) => {
  try {
    const data = await apiClient.patch(
      `${DEBT_API_URL}company/${companyId}/debts/${debtId}`,
      debtData
    );

    // Clear debts cache
    apiClient.clearCache("/debts");

    console.log("Debt updated:", data);
    return data;
  } catch (error) {
    console.error("Error updating debt:", error);
    throw error;
  }
};

/**
 * Delete a debt
 *
 * CACHING: DELETE never cached. Clears debts cache.
 */
export const deleteDebt = async (debtId, companyId) => {
  try {
    const data = await apiClient.delete(
      `${DEBT_API_URL}company/${companyId}/debts/${debtId}`
    );

    // Clear debts cache
    apiClient.clearCache("/debts");

    console.log("Debt deleted:", data);
    return data;
  } catch (error) {
    console.error("Error deleting debt:", error);
    throw error;
  }
};

/**
 * Record a payment/repayment for a debt
 *
 * CACHING: POST never cached. Clears debts cache after repayment.
 */
export const recordRepayment = async (repaymentData) => {
  try {
    const data = await apiClient.post(
      `${DEBT_API_URL}/repayment`,
      repaymentData
    );

    // Clear debts cache since balance changed
    apiClient.clearCache("/debts");

    console.log("Repayment recorded:", data);
    return data;
  } catch (error) {
    console.error("Error recording repayment:", error);
    throw error;
  }
};

/**
 * Mark debt as paid
 * Creates repayment for remaining amount and marks PAID
 *
 * CACHING: POST never cached. Clears debts cache.
 */
export const markDebtAsPaid = async (debtId, companyId, userId, userName) => {
  try {
    const payload = {
      companyId: companyId,
      paymentId: crypto.randomUUID(),
      paymentMethod: "CASH",
      paymentReference: `MARK-PAID-${Date.now()}`,
      createdBy: {
        id: userId || "temp-user-id",
        name: userName || "POS User",
      },
    };

    const data = await apiClient.post(
      `${DEBT_API_URL}/${debtId}/mark-paid`,
      payload
    );

    // Clear debts cache
    apiClient.clearCache("/debts");

    console.log("Debt marked as paid:", data);
    return data;
  } catch (error) {
    console.error("Error marking debt as paid:", error);
    throw error;
  }
};

/**
 * Cancel a debt (mark as CANCELLED)
 *
 * CACHING: POST never cached. Clears debts cache.
 */
export const cancelDebt = async (
  debtId,
  companyId,
  userId,
  userName,
  reason = "customer_requested_refund_or_writeoff"
) => {
  try {
    const payload = {
      companyId: companyId,
      reason: reason,
      performedBy: {
        id: userId || "temp-user-id",
        name: userName || "POS User",
      },
    };

    const data = await apiClient.post(
      `${DEBT_API_URL}/${debtId}/cancel`,
      payload
    );

    // Clear debts cache
    apiClient.clearCache("/debts");

    console.log("Debt cancelled:", data);
    return data;
  } catch (error) {
    console.error("Error cancelling debt:", error);
    throw error;
  }
};

export default {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  recordRepayment,
  markDebtAsPaid,
  cancelDebt,
};
