import axios from 'axios';

const SHOP_API_URL = process.env.NEXT_PUBLIC_BRANCHES_API_URL

export const getAllShops = async () => {
    try {
        const response = await axios.get(SHOP_API_URL, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Shops fetched:", response.data);

        // Handle different response structures
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (response.data && Array.isArray(response.data.shops)) {
            return response.data.shops;
        }

        console.warn("Unexpected API response structure:", response.data);
        return [];
    } catch (error) {
        // Only log warnings in development for 404 errors
        if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to fetch shops:', error.response?.status === 404 ? '404 - Endpoint not found' : error.message);
        }
        return [];
    }
};

export const deleteShop = async (shopId) => {
    try {
        const response = await axios.delete(`${SHOP_API_URL}/${shopId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Shop deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to delete shop:', error.response?.data || error.message);
        throw error;
    }
};

export const createShop = async (shopData) => {
    try {
        const response = await axios.post(SHOP_API_URL, shopData, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            },
        });
        console.log("Shop created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create shop:', error.response?.data || error.message);
        throw error;
    }
};
