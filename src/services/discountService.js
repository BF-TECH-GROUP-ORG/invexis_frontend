import apiClient from "@/lib/apiClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all discounts for a company
 * GET /v1/discounts/company/:companyId
 */
export async function getDiscounts({ companyId, page = 1, limit = 20, status, type }) {
    try {
        if (!companyId) throw new Error("Company ID is required");
        const params = { page, limit };
        if (status) params.status = status;
        if (type) params.type = type;

        const data = await apiClient.get(`${API_BASE}/inventory/v1/discounts/company/${companyId}`, {
            params
        });
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Get a single discount by ID
 * GET /v1/discounts/:id
 */
export async function getDiscountById(id) {
    try {
        const data = await apiClient.get(`${API_BASE}/inventory/v1/discounts/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Create a new discount
 * POST /v1/discounts
 */
export async function createDiscount(payload) {
    try {
        const data = await apiClient.post(`${API_BASE}/inventory/v1/discounts`, payload);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Update a discount
 * PUT /v1/discounts/:id
 */
export async function updateDiscount(id, updates) {
    try {
        const data = await apiClient.put(`${API_BASE}/inventory/v1/discounts/${id}`, updates);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete a discount
 * DELETE /v1/discounts/:id
 */
export async function deleteDiscount(id) {
    try {
        const data = await apiClient.delete(`${API_BASE}/inventory/v1/discounts/${id}`);
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Toggle discount status (active/inactive)
 * PATCH /v1/discounts/:id/toggle
 */
export async function toggleDiscountStatus(id) {
    try {
        const data = await apiClient.patch(`${API_BASE}/inventory/v1/discounts/${id}/toggle`, {});
        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Apply discount to products
 * POST /v1/discounts/:id/apply
 */
export async function applyDiscountToProducts(id, productIds) {
    try {
        const data = await apiClient.post(`${API_BASE}/inventory/v1/discounts/${id}/apply`, { productIds });
        return data;
    } catch (err) {
        throw err;
    }
}

export default {
    getDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    applyDiscountToProducts
};
