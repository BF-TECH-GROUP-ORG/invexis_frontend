import axios from "axios";
import { signOut, getSession } from "next-auth/react";
import { notificationBus } from "@/lib/notificationBus";

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
  const responseData = error?.response?.data;
  const message = responseData?.message ||
    error?.response?.statusText ||
    error?.message ||
    "Unexpected error";

  const status = error?.response?.status ?? (error?.request ? 0 : -1);
  const code = error?.code || error?.originalError?.code;

  return {
    message: status === 0 ? `Network Error: ${code || 'Unknown'} (${message})` : message,
    status,
    code,
    data: responseData || null,
    config: error?.config || error?.originalError?.config,
    stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    originalError: process.env.NODE_ENV === "development" ? error : undefined,
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
            console.log(
              `[Axios] Attached Token for ${config.url}: ${token.substring(
                0,
                10
              )}...`
            );
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
        "[API →]",
        config.method?.toUpperCase(),
        config.url,
        "Headers:",
        config.headers
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
      console.log("[API ←]", response.config?.url, response.status);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Network or CORS error
    if (!response) {
      const normalized = normalizeError(error);
      notificationBus.error(normalized.message);
      return Promise.reject(normalized);
    }

    // Hard stop: never retry refresh endpoint
    if (config?.url?.includes("/auth/refresh")) {
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/auth/login" });
      }
      const normalized = normalizeError(error);
      notificationBus.error("Session expired. Please log in again.");
      return Promise.reject(normalized);
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

    // For all other errors, show notification unless it's a 401 that might be retried
    if (response.status !== 401) {
      const normalized = normalizeError(error);
      notificationBus.error(normalized.message);
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
