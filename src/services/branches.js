import apiClient from "@/lib/apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getBranches = async (companyId, options = {}) => {
  try {
    if (!companyId) return [];
    const url = `${BASE_URL}/shop/`;
    console.log(`Fetching branches from: ${url} with companyId:`, companyId);
    const response = await apiClient.get(url, {
      params: { companyId },
      cache: { ttl: 5 * 60 * 1000 },
      ...options,
    });
    console.log("Branches API Raw Response:", response);
    console.log("Response.data structure:", response.data);

    // Axios wraps the response in response.data
    // Backend returns: {success: true, data: Array(...), pagination: {...}}
    const apiResponse = response.data;

    // Check if we have the nested data structure
    if (apiResponse && typeof apiResponse === 'object') {
      // Case 1: Standard API response with data property containing array
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        console.log("✓ Extracting from response.data.data - found array with", apiResponse.data.length, "items");
        return apiResponse.data;
      }

      // Case 2: Direct array in response (shouldn't happen with this API)
      if (Array.isArray(apiResponse)) {
        console.log("✓ Response is direct array with", apiResponse.length, "items");
        return apiResponse;
      }

      // Case 3: Array directly (edge case)
      if (apiResponse.length !== undefined && apiResponse.length >= 0) {
        console.log("✓ Response detected as array with", apiResponse.length, "items");
        return apiResponse;
      }
    }

    console.warn("⚠️ Unexpected branches response structure:", apiResponse);
    throw new Error(`Invalid branches response structure. Expected array or {data: Array}, got: ${JSON.stringify(apiResponse).substring(0, 100)}`);
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
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
