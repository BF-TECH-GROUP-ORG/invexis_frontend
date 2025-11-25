
import axios from 'axios';

// Prefer a local proxy base when available (NEXT_PUBLIC_API_URL), otherwise use the explicit inventory API URL.
// This mirrors productsService so local dev can set `NEXT_PUBLIC_API_URL=/api` and avoid CORS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'https://granitic-jule-haunting.ngrok-free.dev/api/inventory/v1/';

// Only send the ngrok skip header when the API base points to ngrok (helps avoid unnecessary CORS preflights)
const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
  ? { 'ngrok-skip-browser-warning': 'true' }
  : {};

if (typeof window !== 'undefined') {
  console.info('CategoriesService: using API base ->', API_BASE);
}

export async function getCategories(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/categories`, { params, headers: defaultHeaders });
    return res.data;
  } catch (err) {
    // propagate the error so calling code can handle it (no mock fallback)
    throw err;
  }
}

export async function createCategory(payload) {
  try {
    const res = await axios.post(`${API_BASE}/categories`, payload, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function updateCategory(id, updates) {
  try {
    const res = await axios.put(`${API_BASE}/categories/${id}`, updates, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    const res = await axios.delete(`${API_BASE}/categories/${id}`, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export default { getCategories, createCategory, updateCategory, deleteCategory };
