import axios from "axios";

// Base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api", // backend API
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // for cookies (optional)
});

// Request Interceptor → attach token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor → handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Example: if unauthorized, redirect to login
      if (error.response.status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
