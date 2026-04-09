import apiClient from "@/lib/apiClient";


export const getBranches = async (companyId, options = {}) => {
  try {
    if (!companyId) return [];
    const url = `/shop/`;

    const response = await apiClient.get(url, {
      params: { companyId },
      cache: { ttl: 5 * 60 * 1000 },
      ...options,
    });


    // Axios wraps the response in response.data
    // Backend returns: {success: true, data: Array(...), pagination: {...}}
    const apiResponse = response.data || response;

    // Support both wrapped { data: [...] } and direct [...] responses
    let branches = [];
    if (Array.isArray(apiResponse)) {
      branches = apiResponse;
    } else if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
      branches = apiResponse.data;
    } else if (apiResponse && apiResponse.shops && Array.isArray(apiResponse.shops)) {
      branches = apiResponse.shops;
    } else if (apiResponse && apiResponse.branches && Array.isArray(apiResponse.branches)) {
      branches = apiResponse.branches;
    }

    if (branches.length > 0 || Array.isArray(branches)) {
      return branches;
    }

    console.warn("⚠️ Unexpected branches response structure:", apiResponse);
    return [];
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
    throw error;
  }
};

export const getBranchById = async (branchId, companyId) => {
  try {
    const response = await apiClient.get(`/shop/${branchId}`, {
      params: { companyId },
    });

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
    const response = await apiClient.post(`/shop`, branchData);
    apiClient.clearCache("shop");
    apiClient.clearCache("branches");

    return response;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};

export const updateBranch = async (branchId, branchData, companyId) => {
  try {
    const response = await apiClient.patch(
      `/shop/${branchId}`,
      branchData,
      {
        params: { companyId },
      }
    );
    apiClient.clearCache("shop");
    apiClient.clearCache("branches");

    return response;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

export const deleteBranch = async (branchId, companyId) => {
  try {
    const response = await apiClient.delete(`/shop/${branchId}`, {
      params: { companyId },
    });
    apiClient.clearCache("shop");
    apiClient.clearCache("branches");

    return response;
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};
