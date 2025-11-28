import axios from "axios";
import store from "@/store";
import { updateAccessToken, clearAuthSession } from "@/features/auth/authSlice";

// -----------------------------------------------------
// Base API instance
// -----------------------------------------------------
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // Needed for refresh token cookie
});

// -----------------------------------------------------
// Request Interceptor → attach access token
// -----------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------
// Token Refresh Logic
// -----------------------------------------------------
let isRefreshing = false;
let refreshPromise = null;
let subscribers = [];

function addSubscriber(cb) {
  subscribers.push(cb);
}

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

// -----------------------------------------------------
// Response Interceptor → Handle 401 + Refresh Token
// -----------------------------------------------------
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { config, response } = error;

    // Network errors
    if (!response) {
      console.error("❌ Network Error:", error.message);
      return Promise.reject(error);
    }

    // Skip if it's NOT a 401
    if (response.status !== 401) {
      console.error("❌ API Error:", response.status, response.data);
      return Promise.reject(error);
    }

    // Prevent retrying refresh request itself
    if (config.url?.includes("/auth/refresh")) {
      console.warn("⚠️ Refresh endpoint returned 401 - forcing logout");
      store.dispatch(clearAuthSession());
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // Avoid infinite retry loops
    if (config.__isRetry) {
      console.error("❌ Refresh failed — rejecting retry");
      store.dispatch(clearAuthSession());
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    config.__isRetry = true;

    // -------------------------------------------------
    // Start refresh request if not started already
    // -------------------------------------------------
    if (!isRefreshing) {
      isRefreshing = true;

      console.log("🔄 Refreshing access token...");

      refreshPromise = axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        )
        .then(({ data }) => {
          const newToken = data.accessToken;

          console.log("✅ Token refreshed successfully");

          // Update default headers so new requests use updated token
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          // Update Redux store
          store.dispatch(updateAccessToken(newToken));

          // Resolve queued subscribers
          onRefreshed(newToken);

          return newToken;
        })
        .catch((refreshErr) => {
          console.error("❌ Refresh failed:", refreshErr.message);

          // Reject all queued requests
          onRefreshed(null);

          store.dispatch(clearAuthSession());

          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }

          throw refreshErr;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    // -------------------------------------------------
    // Queue requests while refresh is happening
    // -------------------------------------------------
    return new Promise((resolve, reject) => {
      addSubscriber((token) => {
        if (!token) {
          return reject(error);
        }

        // Attach updated token to original request
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;

        resolve(api(config));
      });
    });
  }
);

export default api;
