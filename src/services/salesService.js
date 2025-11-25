// lib/api/products.js   ← Replace your current file with this
import axios from 'axios';


const URL = process.env.NEXT_PUBLIC_INVENTORY_API_URL
const SALES_URL = process.env.NEXT_PUBLIC_SALES_API_URL

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

export const SellProduct = async (saleData, sellPrice) => {
  try {
    console.log("--- SellProduct Service Called ---");
    console.log("Target URL:", SALES_URL);
    console.log("Payload:", JSON.stringify(saleData, null, 2));

    const response = await axios.post(SALES_URL, saleData, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    console.log("Product sold successfully. Response:", response.data);
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
