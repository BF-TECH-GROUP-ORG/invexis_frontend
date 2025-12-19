import axios from "axios";
import { signOut, getSession } from "next-auth/react";

/**
 * -----------------------------------------------------
 * Axios API Instance
 * -----------------------------------------------------
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 15000, // prevent hanging requests
  withCredentials: false, // Set to false to avoid CORS issues with Bearer tokens
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * -----------------------------------------------------
 * Error Normalizer
 * Ensures consistent error shape across the app
 * -----------------------------------------------------
 */
function normalizeError(error) {
  if (error?.response) {
    return {
      message:
        error.response.data?.message ||
        error.response.statusText ||
        "Request failed",
      status: error.response.status,
      data: error.response.data,
    };
  }

  if (error?.request) {
    return {
      message: "No response from server",
      status: 0,
      data: null,
    };
  }

  return {
    message: error?.message || "Unexpected error",
    status: -1,
    data: null,
  };
}

/**
 * -----------------------------------------------------
 * Request Interceptor
 * - SSR-safe manual token support
 * - Client-side NextAuth token injection
 * - AbortController support
 * -----------------------------------------------------
 */
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    // AbortController support (for deduplication / cancellation)
    if (!config.signal && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      config.signal = controller.signal;
    }

    // SSR-safe check
    if (config.headers.Authorization) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Axios] Using existing Auth header for ${config.url}`);
      }
      return config;
    }

    // Client-side NextAuth token attachment
    if (typeof window !== "undefined") {
      try {
        // Simple singleton/memoization to avoid race conditions with multiple concurrent requests
        if (!window._next_auth_session_promise) {
          window._next_auth_session_promise = getSession();
          // Clear it after 500ms to allow fresh checks later
          setTimeout(() => { window._next_auth_session_promise = null; }, 500);
        }

        const session = await window._next_auth_session_promise;
        const token = session?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          if (process.env.NODE_ENV === "development") {
            const maskedToken = token.length > 10 ? `${token.substring(0, 10)}...` : "short-token";
            console.log(`[Axios →] Token Injection Success for ${config.url}`);
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[Axios ⚠] Token Injection Failed - No accessToken in session for ${config.url}`);
          }
        }
      } catch (e) {
        console.error("[Axios ❌] Session fetch error:", e);
      }
    }

    if (process.env.NODE_ENV === "development") {
      const authHeader = config.headers.Authorization || "";
      console.log(
        `[${config.method?.toUpperCase()}] ${config.url}`,
        {
          auth: authHeader ? `${authHeader.substring(0, 15)}...` : "MISSING",
          headers: config.headers
        }
      );
    }

    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

/**
 * -----------------------------------------------------
 * Response Interceptor
 * - 401 retry once
 * - Hard stop on refresh endpoints
 * - Forced sign-out on auth failure
 * -----------------------------------------------------
 */
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[API ←]",
        response.config?.url,
        response.status
      );
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Network or CORS error
    if (!response) {
      return Promise.reject(normalizeError(error));
    }

    // Hard stop: never retry refresh endpoint
    if (config?.url?.includes("/auth/refresh")) {
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/auth/login" });
      }
      return Promise.reject(normalizeError(error));
    }

    // Retry once on 401
    if (response.status === 401 && !config.__isRetry) {
      config.__isRetry = true;

      try {
        const session = await getSession();
        const newToken = session?.accessToken;

        if (newToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        }
      } catch {
        // fall through to sign out
      }

      // Force sign out
      if (typeof window !== "undefined") {
        try {
          const match = window.location.pathname.match(
            /^\/([a-z]{2})(?:\/|$)/i
          );
          const locale = match ? match[1] : "en";
          signOut({ callbackUrl: `/${locale}/auth/login` });
        } catch {
          signOut({ callbackUrl: "/auth/login" });
        }
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
