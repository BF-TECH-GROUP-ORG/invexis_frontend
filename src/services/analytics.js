const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const getAnalytics = async (companyID) => {
    const response = await fetch(`${API_BASE}/analytics/${companyID}`);
    return response.json();
};

