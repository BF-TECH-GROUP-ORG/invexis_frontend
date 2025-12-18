import apiClient from "@/lib/apiClient";
import { getCacheStrategy } from "@/lib/cacheConfig";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/inventory/v1/products`;
const SALES_URL = `${process.env.NEXT_PUBLIC_API_URL}/sales`;
const DEBT_URL = `/debt`;

export const getAllProducts = async (companyId = null) => {
  const cacheStrategy = getCacheStrategy("INVENTORY", "METADATA");


  try {
    let requestUrl = URL;
    if (companyId) {
      requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/inventory/v1/companies/${companyId}/products`;
    }

    const apiData = await apiClient.get(requestUrl, { cache: cacheStrategy });

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
    const endpoint = isDebt ? `${DEBT_URL}/create` : `${SALES_URL}`;

    console.log("--- SellProduct Service Called ---");
    console.log("Transaction Type:", isDebt ? "DEBT" : "REGULAR SALE");
    console.log("Target URL:", endpoint);

    let payload = saleData;

    // Transform payload for debt API if needed
    if (isDebt) {
      payload = {
        companyId: saleData.companyId,
        shopId: saleData.shopId,
        customerId:
          saleData.customerId || generateCustomerId(saleData.customerPhone),
        salesStaffId: saleData.soldBy,
        items: saleData.items.map((item) => ({
          itemId: item.productId,
          itemName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: saleData.totalAmount,
        amountPaidNow: 0,
        dueDate: calculateDueDate(),
        shareLevel: "PARTIAL",
        consentRef: `CONSENT-${Date.now()}`,
        metadata: {
          customerName: saleData.customerName,
          customerPhone: saleData.customerPhone,
          customerEmail: saleData.customerEmail,
          paymentMethod: saleData.paymentMethod,
        },
      };
    }

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const data = await apiClient.post(endpoint, payload);

    // Clear sales and inventory caches
    apiClient.clearCache("/sales");
    apiClient.clearCache("/inventory");
    if (isDebt) {
      apiClient.clearCache("/debts");
    }

    console.log("Transaction successful. Response:", data);
    return data;
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
export const getSalesHistory = async (companyId) => {
  if (typeof companyId === "object") {
    console.error("Invalid companyId passed to getSalesHistory:", companyId);
    throw new Error("Invalid companyId: Object passed instead of string");
  }

  const cacheStrategy = getCacheStrategy("SALES", "HISTORICAL");

  try {
    const data = await apiClient.get(`${SALES_URL}?companyId=${companyId}`, {
      cache: cacheStrategy,
    });
    console.log("Sales history fetched:", data);
    return data;
  } catch (error) {
    console.log("Failed to fetch sales history:", error.message);
    return [];
  }
};

/**
 * Get single sale by ID
 *
 * CACHING: Sale details cached for 2 minutes
 */
export const getSingleSale = async (saleId) => {
  const cacheStrategy = getCacheStrategy("SALES", "HISTORICAL");

  try {
    const data = await apiClient.get(`${SALES_URL}/${saleId}`, {
      cache: cacheStrategy,
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
  return dueDate.toISOString().split("T")[0];
};

// Helper: Generate customer ID from phone
const generateCustomerId = (phone) => {
  return `CUST-${phone.replace(/\D/g, "")}`;
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
  getSingleSale,
  updateSale,
  deleteSale,
  createReturn,
};
