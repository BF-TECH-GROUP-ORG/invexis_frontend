import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/inventory/v1/products`;
const SALES_URL = `${process.env.NEXT_PUBLIC_API_URL}/sales`;
const DEBT_URL = `/debt`;

export const getAllProducts = async (companyId = null, options = {}) => {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");


  try {
    let requestUrl = URL;
    if (companyId) {
      requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/inventory/v1/companies/${companyId}/products`;
    }

    const apiData = await apiClient.get(requestUrl, { cache: cacheStrategy, ...options });

    console.log('Products fetched:', apiData.data);

    // Safely handle success flag
    if (apiData.success === false) {
      console.error("API returned error:", apiData.message);
      return [];
    }

    const rawProducts = apiData.data || [];
    console.log("Products fetched:", rawProducts);

    return rawProducts.map((product) => ({
      id: product._id || product.id,
      ProductId: product.identifiers?.sku || product.sku || product.asin || product._id.slice(-8),
      ProductName: product.name || "No Name",
      Category:
        product.category?.name || product.subcategory?.name || "Uncategorized",
      Quantity: product.stock?.available || product.inventory?.quantity || 0,
      Price:
        product.effectivePrice ||
        product.pricing?.salePrice ||
        product.pricing?.basePrice ||
        0,
      Cost: product.pricing?.cost || 0,
      brand: product.brand || "No Brand",
      manufacturer: product.manufacturer,
      shopId: product.shopId,
    }));
  } catch (error) {
    console.log("Failed to fetch products:", error.message);
    return [];
  }
};

export const singleProductFetch = async (productId) => {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");

  try {
    const data = await apiClient.get(`${URL}/${productId}`, {
      cache: cacheStrategy,
    });
    console.log("Single product fetched:", data);
    return data;
  } catch (error) {
    console.log("Failed to fetch single product:", error.message);
    return null;
  }
};

/**
 * Create a sale or debt transaction
 *
 * CACHING: POST never cached. Clears sales cache after creation.
 *
 * @param {Object} saleData - Sale transaction data
 * @param {boolean} isDebt - Whether this is a debt transaction
 */
export const SellProduct = async (saleData, isDebt = false) => {
  try {
    console.log("--- SellProduct Service Called ---");
    console.log("Transaction Type:", isDebt ? "DEBT + SALE" : "REGULAR SALE");

    // 1. Always record the sale first
    // We use the relative URL to ensure it uses the baseURL from axios instance
    console.log("Recording sale...");
    const saleResponse = await apiClient.post("/sales", saleData);
    console.log("Sale recorded:", saleResponse);

    // 2. If it's a debt, also record the debt
    if (isDebt) {
      const debtPayload = {
        companyId: saleData.companyId,
        shopId: saleData.shopId,
        customer: {
          name: saleData.customerName,
          phone: saleData.customerPhone,
        },
        items: saleData.items.map((item) => ({
          itemId: item.productId,
          itemName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: saleData.totalAmount,
        amountPaidNow: saleData.amountPaidNow || 0,
        dueDate: calculateDueDate(),
        createdBy: saleData.soldBy,
        isDebt: true,
      };

      console.log("Recording debt...");
      console.log("Debt Payload:", JSON.stringify(debtPayload, null, 2));
      try {
        await apiClient.post("/debt/create", debtPayload);
      } catch (debtError) {
        console.error("Debt recording failed, but sale was recorded:", debtError.message);
        // We don't throw here because the sale was already successful
      }
    }

    // Clear relevant caches
    apiClient.clearCache("/sales");
    apiClient.clearCache("/inventory");
    if (isDebt) {
      apiClient.clearCache("/debts");
    }

    console.log("Transaction processed successfully.");
    return saleResponse;
  } catch (error) {
    console.error("--- SellProduct Service Error ---");
    console.error("Error Message:", error.message);
    throw error;
  }
};

/**
 * Get sales history for a company
 *
 * CACHING: Historical sales cached for 2 minutes (frequently changing)
 */
export const getSalesHistory = async (companyId, filters = {}, options = {}) => {
  if (!companyId) {
    console.error("companyId is required for getSalesHistory");
    return [];
  }

  const cacheStrategy = getCacheStrategy("SALES", "HISTORICAL");
  const { shopId, soldBy } = filters;

  try {
    let queryParams = `companyId=${companyId}`;
    if (shopId) queryParams += `&shopId=${shopId}`;
    if (soldBy) queryParams += `&soldBy=${soldBy}`;

    const data = await apiClient.get(`${SALES_URL}?${queryParams}`, {
      cache: cacheStrategy,
      ...options
    });
    console.log("Sales history fetched:", data);

    // Handle cases where the API wraps the array in an object
    if (data && !Array.isArray(data)) {
      return data.sales || data.data || data.history || [];
    }

    return data || [];
  } catch (error) {
    console.log("Failed to fetch sales history:", error.message);
    return [];
  }
};

/**
 * Get sales history for a specific worker
 * 
 * @param {string} soldBy - Worker ID or username
 * @param {string} companyId - Company ID
 */
export const getSalesByWorker = async (soldBy, companyId, options = {}) => {
  const cacheStrategy = getCacheStrategy("SALES", "HISTORICAL");

  try {
    const data = await apiClient.get(`/sales/sold-by?soldBy=${soldBy}&companyId=${companyId}`, {
      cache: cacheStrategy,
      ...options
    });
    console.log(`Sales history for worker ${soldBy} fetched:`, data);

    // Handle cases where the API wraps the array in an object
    if (data && !Array.isArray(data)) {
      return data.sales || data.data || data.history || [];
    }

    return data || [];
  } catch (error) {
    console.log(`Failed to fetch sales history for worker ${soldBy}:`, error.message);
    return [];
  }
};

/**
 * Get single sale by ID
 *
 * CACHING: Sale details cached for 2 minutes
 */
export const getSingleSale = async (saleId, options = {}) => {
  const cacheStrategy = getCacheStrategy("SALES", "HISTORICAL");

  try {
    const data = await apiClient.get(`${SALES_URL}/${saleId}`, {
      cache: cacheStrategy,
      ...options
    });
    console.log("Single sale fetched:", data);
    return data;
  } catch (error) {
    console.log("Failed to fetch sale details:", error.message);
    return null;
  }
};

/**
 * Update a sale
 *
 * CACHING: PUT never cached. Clears sales cache.
 */
export const updateSale = async (saleId, updateData) => {
  try {
    const data = await apiClient.put(
      `${SALES_URL}/${saleId}/contents`,
      updateData
    );

    // Clear sales cache
    apiClient.clearCache("/sales");

    console.log("Sale updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to update sale:", error.message);
    throw error;
  }
};

/**
 * Delete a sale
 *
 * CACHING: DELETE never cached. Clears sales cache.
 */
export const deleteSale = async (saleId) => {
  try {
    const data = await apiClient.delete(`${SALES_URL}/${saleId}`);

    // Clear sales cache
    apiClient.clearCache("/sales");

    console.log("Sale deleted successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to delete sale:", error.message);
    throw error;
  }
};

// Helper: Calculate due date (30 days from now)
const calculateDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.toISOString();
};

// Helper: Generate customer ID from phone
const generateCustomerId = (phone) => {
  return `CUST-${phone.replace(/\D/g, "")}`;
};

export const getCustomers = async () => {
  const cacheStrategy = getCacheStrategy("SALES", "METADATA");
  try {
    const data = await apiClient.get(`${SALES_URL}/k/all`, {
      cache: cacheStrategy
    });
    console.log("Customers fetched:", data);

    // Structure: { success: true, data: [...], pagination: {...} }
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch customers:", error.message);
    return [];
  }
};

export const createReturn = async (returnData) => {
  try {
    const data = await apiClient.post(`${SALES_URL}/return`, returnData);

    // Clear sales cache
    apiClient.clearCache("/sales");

    console.log("Return created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create return:", error.message);
    throw error;
  }
};

export default {
  getAllProducts,
  singleProductFetch,
  SellProduct,
  getSalesHistory,
  getSalesByWorker,
  getSingleSale,
  updateSale,
  deleteSale,
  createReturn,
  getCustomers,
};
