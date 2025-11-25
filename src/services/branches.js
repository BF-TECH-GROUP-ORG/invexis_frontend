const { default: axios } = require("axios");

const BRANCH_API_URL = process.env.NEXT_PUBLIC_BRANCHES_API_URL;

export const getBranches = async () => {
    try {
        const companyId = "07f0c16d-95af-4cd6-998b-edfea57d87d7";

        const response = await axios.get(
            `${BRANCH_API_URL}/all?companyId=${companyId}`,
            {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                },
            }
        );

        console.log("Branches fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching branches:", error);
        throw error;
    }
};


export const createBranch = async (branchData) => {
    try {
        const response = await axios.post(BRANCH_API_URL, branchData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
                // "Content-Type": "application/json",
            },
        });
        console.log("Branch created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating branch:", error);
        throw error;
    }
};  


export const updateBranch = async (branchData) => {
    try {
        const response = await axios.put(BRANCH_API_URL + branchData.id, branchData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
                // "Content-Type": "application/json",
            },
        });
        console.log("Branch updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating branch:", error);
        throw error;
    }
};  
