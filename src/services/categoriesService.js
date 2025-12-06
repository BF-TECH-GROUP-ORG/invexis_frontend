import axios from 'axios';

// Prefer a local proxy base when available (NEXT_PUBLIC_API_URL), otherwise use the explicit inventory API URL.
// This mirrors productsService so local dev can set `NEXT_PUBLIC_API_URL=/api` and avoid CORS.
const API_BASE = process.env.NEXT_PUBLIC_API_URL





// Only send the ngrok skip header when the API base points to ngrok (helps avoid unnecessary CORS preflights)
const defaultHeaders = (typeof API_BASE === 'string' && API_BASE.includes('ngrok'))
  ? { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' }
  : {};

if (typeof window !== 'undefined') {
  console.info('CategoriesService: using API base ->', API_BASE);
}

// function to get company id
export async function getCompanyId(companyId) {
  try {
    if (!companyId) throw new Error("Company ID is required to fetch company details");
    const res = await axios.get(`${API_BASE}/company/companies/${companyId}`, { headers: defaultHeaders });
    console.log('receved data', res.data)
    return res.data;
  } catch (err) {
    // propagate the error so calling code can handle it (no mock fallback)
    throw err;
  }
}

// get category by ids
export async function ParentCategories(companyId) {
  try {
    console.log("ParentCategories service called with:", companyId);
    const companyData = await getCompanyId(companyId);
    // Extract category_ids from the response
    // Based on user provided structure: { data: { category_ids: [...] }, ... }
    const categoryIds = companyData?.data?.category_ids || [];

    if (!categoryIds.length) {
      return { data: [] };
    }

    const res = await axios.post(`${API_BASE}/inventory/v1/categories/by-ids`, { ids: categoryIds }, { headers: defaultHeaders });
    console.log('receved data', res.data)
    return res.data;
  } catch (err) {
    // propagate the error so calling code can handle it (no mock fallback)
    throw err;
  }
}

export async function getCategories(params = {}) {
  try {
    const { companyId } = params;
    if (!companyId) throw new Error("Company ID is required");
    const res = await axios.get(`${API_BASE}/inventory/v1/categories/company/${companyId}/level3`, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

//create category
export async function createCategory(payload) {
  try {
    const { companyId } = payload;
    if (!companyId) throw new Error("Company ID is required for creation");
    const res = await axios.post(`${API_BASE}/inventory/v1/categories/company/${companyId}/level3`, payload, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function updateCategory(id, updates) {
  try {
    const res = await axios.put(`${API_BASE}/inventory/v1/categories/${id}`, updates, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    const res = await axios.delete(`${API_BASE}/inventory/v1/categories/${id}`, { headers: defaultHeaders });
    return res.data;
  } catch (err) {
    throw err;
  }
}

export default { getCategories, createCategory, updateCategory, deleteCategory, ParentCategories, getCompanyId };
