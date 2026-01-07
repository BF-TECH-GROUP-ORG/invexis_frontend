import api from "@/lib/axios";

export const AuthService = {
  login: async (identifier, password) => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  requestOtpLogin: async (identifier) => {
    try {
      const response = await api.post("/auth/login/otp", { identifier });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  verifyOtpLogin: async (identifier, otp) => {
    try {
      const response = await api.post("/auth/login/otp/verify", {
        identifier,
        otp,
      });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  // Google auth removed — handled only by Credentials/NextAuth now

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post("/auth/password/reset", { email });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  confirmPasswordReset: async (token, newPassword) => {
    try {
      const response = await api.post("/auth/password/reset/confirm", {
        token,
        newPassword,
      });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  logout: async () => {
    try {
      const response = await api.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/me", profileData);
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post("/auth/me/password/change", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  setup2FA: async () => {
    const response = await api.post("/auth/me/2fa/setup");
    return response.data;
  },

  verify2FASetup: async (token) => {
    const response = await api.post("/auth/me/2fa/verify", { token });
    return response.data;
  },

  disable2FA: async (token) => {
    const response = await api.post("/auth/me/2fa/disable", { token });
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get("/auth/sessions");
    return response.data;
  },

  // Get user by ID (admin / lookup)
  getUserById: async (userId) => {
    if (!userId) throw new Error("userId is required");
    try {
      const response = await api.get(`/auth/me`, { params: { userId } });
      return response.data; // expected shape: { ok: true, user: { ... } }
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  revokeSession: async (sessionId) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};

export default AuthService;
