import apiClient from "@/lib/apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all sales invoices for a company
 * @param {string} companyId - The ID of the company
 * @param {Object} options - Additional request options (e.g. headers)
 * @returns {Promise<Object>} The API response
 */
export const getCompanySalesInvoices = async (companyId, options = {}) => {
    if (!companyId) return { success: false, data: [] };

    try {
        const url = `${BASE_URL}/document/sales/company/${companyId}/invoices`;
        const response = await apiClient.get(url, {
            ...options,
            cache: { ttl: 5 * 60 * 1000 } // 5 minutes cache
        });

        // apiClient.get returns response.data directly
        return response || { success: false, data: [] };
    } catch (error) {
        console.error("Failed to fetch sales invoices documents:", error);
        return { success: false, data: [] };
    }
};

/**
 * Get all inventory media (barcodes, QR codes) for a company
 * @param {string} companyId - The ID of the company
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} The API response
 */
export const getCompanyInventoryMedia = async (companyId, options = {}) => {
    if (!companyId) return { success: false, data: [] };

    try {
        const url = `${BASE_URL}/document/inventory/company/${companyId}/media`;
        const response = await apiClient.get(url, {
            ...options,
            cache: { ttl: 5 * 60 * 1000 }
        });
        return response || { success: false, data: [] };
    } catch (error) {
        console.error("Failed to fetch inventory media documents:", error);
        return { success: false, data: [] };
    }
};

export default {
    getCompanySalesInvoices,
    getCompanyInventoryMedia,
};
