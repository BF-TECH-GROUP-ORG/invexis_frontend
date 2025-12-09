const { default: axios } = require("axios");

const BRANCH_API_URL = process.env.NEXT_PUBLIC_API_URL

export const getBranches = async (companyId) => {
    try {

        const response = await axios.get(`${BRANCH_API_URL}/shop/?companyId=${companyId}`,
            {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                },
            }
        );
        // console.log("baraka joshuah")
        console.log("Branches fetched:", companyId);
        console.log("Branches fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching branches:", error);
        throw error;
    }
};

    
export const getBranchById = async (branchId, companyId) => {
    try {
        const response = await axios.get(`${BRANCH_API_URL}/shop/${branchId}?companyId=${companyId}`, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Branch fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching branch:", error);
        throw error;
    }
};

// Create a new branch
export const createBranch = async (branchData) => {
    // Ensure companyId is a string if it exists in branchData
    if (branchData.companyId && typeof branchData.companyId === 'object') {
        branchData.companyId = branchData.companyId.id || branchData.companyId._id;
    }

    try {
        const response = await axios.post(`${BRANCH_API_URL}/shop`, branchData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
        console.log("Branch created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating branch:", error);
        throw error;
    }
};


export const updateBranch = async (branchId, branchData, companyId) => {
    try {
        const response = await axios.patch(`${BRANCH_API_URL}/shop/${branchId}?companyId=${companyId}`, branchData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },

        });
        console.log("Branch updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating branch:", error);
        throw error;
    }
};


export const deleteBranch = async (branchId, companyId) => {
    try {
        const response = await axios.delete(`${BRANCH_API_URL}/shop/${branchId}?companyId=${companyId}`, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },

        });
        console.log("Branch deleted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting branch:", error);
        throw error;
    }
};
