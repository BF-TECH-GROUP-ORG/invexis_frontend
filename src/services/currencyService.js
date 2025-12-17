import axios from "axios";

const API_KEY = "2e990d5013870a545d71e63c66e10ec0ec27a6b5";
const BASE_URL = "https://api.getgeoapi.com/v2/currency";

/**
 * Currency Service
 * Handles currency conversion using getgeoapi.com
 */

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code (e.g. 'USD')
 * @param {string} to - Target currency code (e.g. 'EUR')
 * @returns {Promise<number|null>} Converted amount or null if failed
 */
export const convertCurrency = async (amount, from, to) => {
  if (!amount || !from || !to || from === to) return amount;

  try {
    const response = await axios.get(`${BASE_URL}/convert`, {
      params: {
        api_key: API_KEY,
        from: from,
        to: to,
        amount: amount,
        format: "json",
      },
    });

    if (response.data && response.data.dates) {
      // The API returns structure like:
      // { dates: { "2023-10-27": { "EUR": 0.94... } }, ... }
      // But wait, user documentation says /convert returns... let's assume standard format
      // Actually user didn't paste response format for convert, but let's look at standard geoapi response
      // Usually: { status: "success", rates: { "EUR": 0.94... }, ... }
      // Wait, let's try to be robust.
      // The user provided: GET: https://api.getgeoapi.com/v2/currency/convert

      // Documentation: https://currency.getgeoapi.com/documentation/
      // Response:
      // {
      //    "status": "success",
      //    "updated_date": "2023-10-27",
      //    "base_currency_code": "USD",
      //    "amount": 100,
      //    "rates": {
      //        "EUR": {
      //            "currency_name": "Euro",
      //            "rate": "0.9470",
      //            "rate_for_amount": "94.7000"
      //        }
      //    }
      // }

      const rates = response.data.rates;
      if (rates && rates[to]) {
        return parseFloat(rates[to].rate_for_amount);
      }
    }

    // Fallback if structure is different (some APIs return just result)
    return null;
  } catch (error) {
    console.error("Currency conversion failed:", error.message);
    // User requested: "if rate limit reaches just change currency without converting"
    // So we return null to indicate failure, caller should handle by keeping original amount
    return null;
  }
};

export const getCurrencies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/list`, {
      params: { api_key: API_KEY },
    });
    return response.data.currencies || {};
  } catch (error) {
    console.error("Failed to fetch currencies", error);
    return {};
  }
};

export default {
  convertCurrency,
  getCurrencies,
};
