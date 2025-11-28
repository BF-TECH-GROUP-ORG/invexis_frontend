import axios from 'axios';

// Prefer a local proxy base when available (NEXT_PUBLIC_API_URL), otherwise use the explicit inventory API URL.
// This mirrors productsService so local dev can set `NEXT_PUBLIC_API_URL=/api` and avoid CORS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_INVENTORY_API_URL || '';

const COMPANY = process.env.NEXT_PUBLIC_COMPANY_API_URL;

const companyId = "02451e1b-9cc8-480a-ae22-bd247c54ad71";

// Only send the ngrok skip header when the API base points to ngrok (helps avoid unnecessary CORS preflights)
const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
  ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  : {};

if (typeof window !== 'undefined') {
  console.info('CategoriesService: using API base ->', API_BASE);
}

// function to get company id
export async function getCompanyId() {
  try {
    const res = await axios.get(`${COMPANY}/companies/${companyId}`, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    // propagate the error so calling code can handle it (no mock fallback)
    throw err;
  }
}

// get category by ids
export async function ParentCategories() {
  try {
    const companyData = await getCompanyId();
    // Extract category_ids from the response
    // Based on user provided structure: { data: { category_ids: [...] }, ... }
    const categoryIds = companyData?.data?.category_ids || [];

    if (!categoryIds.length) {
      return { data: [] };
    }

    const res = await axios.post(`${API_BASE}/categories/by-ids`, { ids: categoryIds }, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    // propagate the error so calling code can handle it (no mock fallback)
    throw err;
  }
}

export async function getCategories(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/categories/company/${companyId}/level3`, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function createCategory(payload) {
  try {
    const res = await axios.post(`${API_BASE}/categories/company/${companyId}/level3`, payload, { headers: defaultHeaders });
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
    const res = await axios.delete(`${API_BASE}/categories/${id}`, companyId, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export default { getCategories, createCategory, updateCategory, deleteCategory, ParentCategories, getCompanyId };
