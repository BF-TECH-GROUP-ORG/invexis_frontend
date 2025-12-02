import axios from "axios";
import { signOut, getSession } from "next-auth/react";

// -----------------------------------------------------
// Base API instance
// -----------------------------------------------------

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,
});

// -----------------------------------------------------
// Request Interceptor → attach access token
// -----------------------------------------------------
api.interceptors.request.use(
  async (config) => {
    // Try to attach access token from next-auth session (client-side)
    if (typeof window !== "undefined") {
      try {
        // getSession resolves to the current session with custom fields from session callback
        const sess = await getSession();
        const token = sess?.accessToken;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore
      }
    }

    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// In the NextAuth world token refresh happens in NextAuth callbacks. On 401 we'll
// attempt one quick re-check of the session and retry once before forcing sign out.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) return Promise.reject(error);

    // Only try to do a single retry for 401s.
    if (response.status === 401 && !config.__isRetry) {
      config.__isRetry = true;

      try {
        // Re-fetch session (jwt callback will attempt to refresh if needed)
        const sess = await getSession();
        const newToken = sess?.accessToken;

        if (newToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        }
      } catch (e) {
        // ignore and allow sign out path below to execute
      }

      // Force sign out / redirect to login
      if (typeof window !== "undefined") {
        // pick up the locale from the pathname so signOut redirects back to localized login
        try {
          const match = window?.location?.pathname?.match(
            /^\/([a-z]{2})(?:\/|$)/i
          );
          const loc = match ? match[1] : "en";
          signOut({ callbackUrl: `/${loc}/auth/login` });
        } catch (e) {
          signOut({ callbackUrl: "/auth/login" });
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
