

import axios from "axios";

// ==================== CONFIGURATION ====================

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================

axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or your preferred storage)
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date().getTime() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API Request] ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ [Request Error]", error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

axiosClient.interceptors.response.use(
  (response) => {
    // Calculate response time
    const duration = new Date().getTime() - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401: // Unauthorized
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              // Try to refresh token
              const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null;
              
              if (refreshToken) {
                const response = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, {
                  refreshToken,
                });

                const newToken = response.data.token;
                
                if (typeof window !== 'undefined') {
                  localStorage.setItem("token", newToken);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, logout user
              if (typeof window !== 'undefined') {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
              }
              return Promise.reject(refreshError);
            }
          }
          
          // If retry already attempted, logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
          break;

        case 403: // Forbidden
          console.error("🚫 Access Denied: You don't have permission to access this resource");
          if (typeof window !== 'undefined') {
            // Optionally redirect to unauthorized page
            // window.location.href = "/unauthorized";
          }
          break;

        case 404: // Not Found
          console.error("🔍 Resource not found");
          break;

        case 422: // Validation Error
          console.error("⚠️ Validation Error:", data.errors || data.message);
          break;

        case 429: // Too Many Requests
          console.error("⏱️ Rate limit exceeded. Please try again later.");
          break;

        case 500: // Server Error
          console.error("💥 Server Error: Something went wrong on the server");
          break;

        case 503: // Service Unavailable
          console.error("🔧 Service temporarily unavailable. Please try again later.");
          break;

        default:
          console.error(`❌ Error ${status}:`, data.message || "Unknown error occurred");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("🌐 Network Error: No response from server. Please check your connection.");
    } else {
      // Something else happened
      console.error("⚠️ Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Upload file with progress tracking
 * @param {string} url - API endpoint
 * @param {FormData} formData - Form data with file
 * @param {Function} onProgress - Progress callback
 */
export const uploadFile = async (url, formData, onProgress) => {
  try {
    const response = await axiosClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Download file
 * @param {string} url - API endpoint
 * @param {string} filename - Name for downloaded file
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await axiosClient.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Retry failed request
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries (ms)
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
  }
};

/**
 * Cancel token source (for cancelling requests)
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// ==================== API ENDPOINTS ====================

/**
 * Document API endpoints
 */
export const documentAPI = {
  // Get all documents
  getAll: (params) => axiosClient.get("/documents", { params }),

  // Get single document by ID
  getById: (id) => axiosClient.get(`/documents/${id}`),

  // Create new document
  create: (data) => axiosClient.post("/documents", data),

  // Update document
  update: (id, data) => axiosClient.put(`/documents/${id}`, data),

  // Delete document(s)
  delete: (ids) => axiosClient.delete("/documents", { data: { ids } }),

  // Bulk update status
  bulkUpdateStatus: (ids, status) => 
    axiosClient.patch("/documents/bulk-status", { ids, status }),

  // Upload document file
  uploadFile: (id, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadFile(`/documents/${id}/upload`, formData, onProgress);
  },

  // Download document
  download: (id, filename) => 
    downloadFile(`/documents/${id}/download`, filename),

  // Export documents
  export: (format, filters) => 
    axiosClient.post("/documents/export", { format, filters }, {
      responseType: "blob",
    }),

  // Search documents
  search: (query, filters) => 
    axiosClient.get("/documents/search", { 
      params: { q: query, ...filters } 
    }),

  // Get document statistics
  getStats: () => axiosClient.get("/documents/stats"),

  // Get categories
  getCategories: () => axiosClient.get("/documents/categories"),

  // Get assignees
  getAssignees: () => axiosClient.get("/documents/assignees"),
};

/**
 * Authentication API endpoints
 */
export const authAPI = {
  // Login
  login: (credentials) => axiosClient.post("/auth/login", credentials),

  // Logout
  logout: () => axiosClient.post("/auth/logout"),

  // Register
  register: (userData) => axiosClient.post("/auth/register", userData),

  // Refresh token
  refresh: (refreshToken) => axiosClient.post("/auth/refresh", { refreshToken }),

  // Get current user
  getUser: () => axiosClient.get("/auth/me"),

  // Update profile
  updateProfile: (data) => axiosClient.put("/auth/profile", data),

  // Change password
  changePassword: (data) => axiosClient.post("/auth/change-password", data),
};

/**
 * User API endpoints
 */
export const userAPI = {
  // Get all users
  getAll: (params) => axiosClient.get("/users", { params }),

  // Get user by ID
  getById: (id) => axiosClient.get(`/users/${id}`),

  // Create user
  create: (data) => axiosClient.post("/users", data),

  // Update user
  update: (id, data) => axiosClient.put(`/users/${id}`, data),

  // Delete user
  delete: (id) => axiosClient.delete(`/users/${id}`),
};

// ==================== EXPORTS ====================

export default axiosClient;

// Export all API modules
export { documentAPI, authAPI, userAPI };