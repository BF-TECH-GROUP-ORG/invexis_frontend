import apiClient from "@/lib/apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getBranches = async (companyId, options = {}) => {
  try {
    const url = `${BASE_URL}/shop/`;
    console.log(`Fetching branches from: ${url}`);
    const response = await apiClient.get(url, {
      params: { companyId },
      ...options,
    });
    console.log("Branches API Raw Response:", response);

    // Handle different possible response structures
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.shops && Array.isArray(response.shops)) return response.shops;
    if (response.branches && Array.isArray(response.branches)) return response.branches;

    console.warn("Unexpected branches response structure:", response);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

export const getBranchById = async (branchId, companyId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/shop/${branchId}`, {
      params: { companyId },
    });
    console.log("Branch fetched:", response);
    return response;
  } catch (error) {
    console.error("Error fetching branch:", error);
    throw error;
  }
};

// Create a new branch
export const createBranch = async (branchData) => {
  // Ensure companyId is a string if it exists in branchData
  if (branchData.companyId && typeof branchData.companyId === "object") {
    branchData.companyId = branchData.companyId.id || branchData.companyId._id;
  }

  try {
    const response = await apiClient.post(`${BASE_URL}/shop`, branchData);
    console.log("Branch created:", response);
    return response;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};

export const updateBranch = async (branchId, branchData, companyId) => {
  try {
    const response = await apiClient.patch(
      `${BASE_URL}/shop/${branchId}`,
      branchData,
      {
        params: { companyId },
      }
    );
    console.log("Branch updated:", response);
    return response;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

export const deleteBranch = async (branchId, companyId) => {
  try {
    const response = await apiClient.delete(`${BASE_URL}/shop/${branchId}`, {
      params: { companyId },
    });
    console.log("Branch deleted:", response);
    return response;
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};
