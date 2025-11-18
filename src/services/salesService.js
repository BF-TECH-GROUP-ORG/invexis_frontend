// lib/api/products.js   ← Replace your current file with this

import axios from 'axios';

const URL = 'https://45803585dad0.ngrok-free.app/api/inventory/inventory/v1/products';

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