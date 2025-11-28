import axios from "axios";
import store from "@/store";
import { updateAccessToken, clearAuthSession } from "@/features/auth/authSlice";

// Base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // MUST be true for cookies (refresh token)
});

// Request Interceptor → attach access token from Redux
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh management
let isRefreshing = false;
let refreshPromise = null;
const subscribers = [];

function onRefreshed(token) {
  subscribers.forEach(cb => cb(token));
  subscribers.length = 0;
}

function addSubscriber(cb) {
  subscribers.push(cb);
}

// Response Interceptor → handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Network error or no response
    if (!response) {
      console.error("❌ Network Error:", error.message);
      return Promise.reject(error);
    }

    // Not a 401, just reject
    if (response.status !== 401) {
      console.error("❌ API Error:", response.status, response.data);
      return Promise.reject(error);
    }

    // Avoid infinite loop - don't retry if already retried
    if (config.__isRetry) {
      console.error("❌ Refresh failed, logging out");
      store.dispatch(clearAuthSession());
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }

    // Mark as retry to avoid infinite loop
    config.__isRetry = true;

    // If not already refreshing, start refresh
    if (!isRefreshing) {
      isRefreshing = true;
      console.log("🔄 Refreshing access token...");
      
      refreshPromise = axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true, // Send refresh token cookie
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      )
        .then(({ data }) => {
          const token = data.accessToken;
          console.log("✅ Token refreshed successfully");
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Update Redux store
          store.dispatch(updateAccessToken(token));
          
          // Notify all queued requests
          onRefreshed(token);
          
          return token;
        })
        .catch((err) => {
          console.error("❌ Refresh failed:", err.message);
          
          // Clear auth and redirect to login
          store.dispatch(clearAuthSession());
          onRefreshed(null);
          
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          
          throw err;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    // Queue this request to retry after refresh completes
    return new Promise((resolve, reject) => {
      addSubscriber((token) => {
        if (!token) {
          return reject(error);
        }
        
        // Retry original request with new token
        config.headers.Authorization = `Bearer ${token}`;
        resolve(api(config));
      });
    });
  }
);

export default api;
