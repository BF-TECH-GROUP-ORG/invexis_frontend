// import axios from "axios";
// import { signOut, getSession } from "next-auth/react";

// // -----------------------------------------------------
// // Base API instance
// // -----------------------------------------------------

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
//   withCredentials: true,
// });

// // -----------------------------------------------------
// // Request Interceptor → attach access token
// // -----------------------------------------------------
// api.interceptors.request.use(
//   async (config) => {
//     // allow manual token injection (SSR-safe)
//     if (config.headers?.Authorization) {
//       return config;
//     }

//     // Try to attach access token from next-auth session (client-side)
//     if (typeof window !== "undefined") {
//       try {
//         // getSession resolves to the current session with custom fields from session callback
//         const sess = await getSession();
//         const token = sess?.accessToken;
//         console.log("Token:", token);
//         if (token) {
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (e) {
//         // ignore
//       }
//     }

//     console.log("📤 Request:", config.method?.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // In the NextAuth world token refresh happens in NextAuth callbacks. On 401 we'll
// // attempt one quick re-check of the session and retry once before forcing sign out.
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const { config, response } = error;

//     if (!response) return Promise.reject(error);

//     // Only try to do a single retry for 401s.
//     if (response.status === 401 && !config.__isRetry) {
//       config.__isRetry = true;

//       try {
//         // Re-fetch session (jwt callback will attempt to refresh if needed)
//         const sess = await getSession();
//         const newToken = sess?.accessToken;

//         if (newToken) {
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${newToken}`;
//           return api(config);
//         }
//       } catch (e) {
//         // ignore and allow sign out path below to execute
//       }

//       // Force sign out / redirect to login
//       if (typeof window !== "undefined") {
//         // pick up the locale from the pathname so signOut redirects back to localized login
//         try {
//           const match = window?.location?.pathname?.match(
//             /^\/([a-z]{2})(?:\/|$)/i
//           );
//           const loc = match ? match[1] : "en";
//           signOut({ callbackUrl: `/${loc}/auth/login` });
//         } catch (e) {
//           signOut({ callbackUrl: "/auth/login" });
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


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
  withCredentials: true,
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
    // Ensure headers object exists
    config.headers = config.headers || {};

    // AbortController support (for deduplication / cancellation)
    if (!config.signal && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      config.signal = controller.signal;
    }

    // SSR-safe: if Authorization already exists, do not override
    if (config.headers.Authorization) {
      return config;
    }

    // Client-side NextAuth token attachment
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        const token = session?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // silent failure
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[API →]",
        config.method?.toUpperCase(),
        config.url
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
