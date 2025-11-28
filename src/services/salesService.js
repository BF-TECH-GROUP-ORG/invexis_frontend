// lib/api/products.js   ← Replace your current file with this
import axios from 'axios';


const URL = process.env.NEXT_PUBLIC_INVENTORY_API_URL
const SALES_URL = process.env.NEXT_PUBLIC_SALES_API_URL
const DEBT_URL = process.env.NEXT_PUBLIC_DEBT_API_URL

export const getAllProducts = async () => {
  try {
    const response = await axios.get(URL, {
      headers: {
        'ngrok-skip-browser-warning': 'true',   // This line fixes everything
        // Optional: you can use any value, even '69420' works
        // 'ngrok-skip-browser-warning': '69420',
      },
    });

    const apiData = response.data;

    // Safely handle success flag
    if (apiData.success === false) {
      console.error('API returned error:', apiData.message);
      return [];
    }

    const rawProducts = apiData.data || [];

    const products = rawProducts.map(product => ({
      id: product._id || product.id,
      ProductId: product.sku || product.asin || product._id.slice(-8),
      ProductName: product.name || 'No Name',
      Category: product.category?.name || product.subcategory?.name || 'Uncategorized',
      Quantity: product.inventory?.quantity || 0,
      Price: product.effectivePrice || product.pricing?.salePrice || product.pricing?.basePrice || 0,
      brand: product.brand || 'No Brand',
      manufacturer: product.manufacturer
    }));

    return products;

  } catch (error) {
    console.log('Failed to fetch products:', error.message);
    return [];
  }
};


export const singleProductFetch = async (productId) => {
  try {
    const response = await axios.get(`${URL}/${productId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log('Single product fetched:', response.data);
    return response.data;
  } catch (error) {
    console.log('Failed to fetch single product:', error.message);
    return null;
  }
}

export const SellProduct = async (saleData, isDebt = false) => {
  try {
    const endpoint = isDebt ? `${DEBT_URL}/create` : SALES_URL;

    console.log("--- SellProduct Service Called ---");
    console.log("Transaction Type:", isDebt ? "DEBT" : "REGULAR SALE");
    console.log("Target URL:", endpoint);

    let payload = saleData;

    // Transform payload for debt API if needed
    if (isDebt) {
      // Map sales payload to debt API structure
      payload = {
        companyId: saleData.companyId,
        shopId: saleData.shopId,
        customerId: saleData.customerId || generateCustomerId(saleData.customerPhone), // You may need a proper customer ID
        salesStaffId: saleData.soldBy,
        items: saleData.items.map(item => ({
          itemId: item.productId,
          itemName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        totalAmount: saleData.totalAmount,
        amountPaidNow: 0, // Debt means not paid now
        dueDate: calculateDueDate(), // Default 30 days from now
        shareLevel: "PARTIAL", // Default share level
        consentRef: `CONSENT-${Date.now()}`, // Generate consent reference
        // Store customer info for reference (not in API spec but useful)
        metadata: {
          customerName: saleData.customerName,
          customerPhone: saleData.customerPhone,
          customerEmail: saleData.customerEmail,
          paymentMethod: saleData.paymentMethod
        }
      };
    }

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(endpoint, payload, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    console.log("Transaction successful. Response:", response.data);
    return response.data;

  } catch (error) {
    console.error("--- SellProduct Service Error ---");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

// Helper function to calculate due date (30 days from now)
const calculateDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

// Helper function to generate customer ID from phone (temporary solution)
// In production, you should have a proper customer management system
const generateCustomerId = (phone) => {
  // This is a placeholder - you should use actual customer IDs from your customer service
  return `CUST-${phone.replace(/\D/g, '')}`;
};



export const getSalesHistory = async (companyId) => {
  try {
    const response = await axios.get(`${SALES_URL}?companyId=${companyId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log("Sales history fetched:", response.data);
    return response.data;

  } catch (error) {
    console.log('Failed to fetch sales history:', error.message);
    return [];
  }
}


export const getSingleSale = async (saleId) => {
  try {
    const response = await axios.get(`${SALES_URL}/${saleId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log("Single sale fetched:", response.data);
    return response.data;
  } catch (error) {
    console.log('Failed to fetch sale details:', error.message);
    return null;
  }
};

export const updateSale = async (saleId, updateData) => {
  try {
    const response = await axios.put(`${SALES_URL}/${saleId}/contents`, updateData, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    });
    console.log("Sale updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update sale:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteSale = async (saleId) => {
  try {
    const response = await axios.delete(`${SALES_URL}/${saleId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log("Sale deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to delete sale:', error.response?.data || error.message);
    throw error;
  }
};
