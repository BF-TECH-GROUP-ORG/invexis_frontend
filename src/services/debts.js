
const DEBT_URL = process.env.NEXT_PUBLIC_API_URL;
const debtsHistory = async () => {
    try {
        const response = await axios.get(`${DEBT_URL}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });
        console.log("Debts history fetched:", response.data);
        return response.data;
    } catch (error) {
        console.log('Failed to fetch debts history:', error.message);
        return [];
    }
}   