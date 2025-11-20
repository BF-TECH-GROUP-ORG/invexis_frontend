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
      manufacturer:product.manufacturer
    }));

    return products;

  } catch (error) {
    console.log('Failed to fetch products:', error.message);
    return [];
  }
};


export const singleProductFetch = async (productId) => {
  try{
    const response = await axios.get(`${URL}/${productId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log('Single product fetched:', response.data);
    return response.data;
  }catch(error){
    console.log('Failed to fetch single product:', error.message);
    return null;
  }
}


export const SellProduct = async (saleData,sellPrice) => {
  try{
    console.log('Selling product with data:', saleData);
    console.log('Using sell price:', sellPrice);
    const sendData = axios.post(SALES_URL, saleData, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    console.log('Product sold successfully:', sendData.data);
    return sendData.data;
  }catch(error){
    console.log('Failed to sell product:', error.message);
  }

}