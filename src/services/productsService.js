import axios from 'axios';

// Prefer a local proxy base when available (NEXT_PUBLIC_API_URL), otherwise use the explicit inventory API URL.
// This allows local dev to set `NEXT_PUBLIC_API_URL=/api/inventory/v1` and use Next.js rewrites to avoid CORS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://6f48f759ca9d.ngrok-free.app/api/inventory/v1/';

// Helpful console hint so you can verify which base is being used at runtime
if (typeof window !== 'undefined') {
  console.info('ProductsService: using API base ->', API_BASE);
}

const defaultHeaders = {
  'ngrok-skip-browser-warning': 'true',
};

// Configure axios timeout. Use `NEXT_PUBLIC_AXIOS_TIMEOUT` (milliseconds).
// If not set or set to `0`, axios will have no timeout (browser default behavior).
const AXIOS_TIMEOUT = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_AXIOS_TIMEOUT
  ? Number(process.env.NEXT_PUBLIC_AXIOS_TIMEOUT)
  : 0;
axios.defaults.timeout = AXIOS_TIMEOUT; // 0 = no timeout
if (typeof window !== 'undefined') console.info('Axios timeout set to', axios.defaults.timeout, 'ms');

export async function getProducts({ page = 1, limit = 20, category, search } = {}) {
  try {
    const params = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;

    const res = await axios.get(`${API_BASE}/products`, { params, headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function getFeaturedProducts() {
  const res = await axios.get(`${API_BASE}/products/featured`, { headers: defaultHeaders });
  return res.data;
}

export async function getProductById(id) {
  const res = await axios.get(`${API_BASE}/products/${id}`, { headers: defaultHeaders });
  return res.data;
}

export async function createProductApi(payload) {
  // When sending FormData, let axios set the Content-Type (with boundary).
  const config = { headers: { ...defaultHeaders } };
  // If payload is plain object, ensure JSON content-type
  if (!(typeof FormData !== 'undefined' && payload instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const res = await axios.post(`${API_BASE}/products`, payload, config);
  return res.data;
}

export async function updateProductApi(id, updates) {
  const res = await axios.put(`${API_BASE}/products/${id}`, updates, { headers: defaultHeaders });
  return res.data;
}

export async function deleteProductApi(id) {
  const res = await axios.delete(`${API_BASE}/products/${id}`, { headers: defaultHeaders });
  return res.data;
}

export async function updateStockApi(id, stockData) {
  const res = await axios.patch(`${API_BASE}/products/${id}/stock`, stockData, { headers: defaultHeaders });
  return res.data;
}

export async function searchProductsApi(query) {
  const res = await axios.get(`${API_BASE}/products/search`, { params: { q: query }, headers: defaultHeaders });
  return res.data;
}

export default {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  updateStockApi,
  searchProductsApi,
};
