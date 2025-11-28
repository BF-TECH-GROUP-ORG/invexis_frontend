// API service that imports mock data and simulates async fetch
import { MOCK_PRODUCTS } from "./mockProductsData";

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchProducts() {
  await delay(250);
  return MOCK_PRODUCTS;
}

export default { fetchProducts };
