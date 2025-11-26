import api from "@/lib/axios";

/**
 * Real Authentication Service
 * Integrates with backend API at https://granitic-jule-haunting.ngrok-free.dev/api/auth
 */
export const AuthService = {
  /**
   * Login with email/password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ok: boolean, accessToken: string, refreshToken: string, user: object}>}
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Request OTP for login
   * @param {string} identifier - Email or phone number
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  requestOtpLogin: async (identifier) => {
    const response = await api.post("/auth/login/otp", { identifier });
    return response.data;
  },

  /**
   * Verify OTP and login
   * @param {string} identifier - Email or phone number
   * @param {string} otp - OTP code
   * @returns {Promise<{ok: boolean, accessToken: string, refreshToken: string, user: object}>}
   */
  verifyOtpLogin: async (identifier, otp) => {
    const response = await api.post("/auth/login/otp/verify", { identifier, otp });
    return response.data;
  },

  /**
   * Initiate Google OAuth login
   * Redirects to Google OAuth page
   */
  loginWithGoogle: () => {
    const googleAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || "/api/auth/google";
    window.location.href = googleAuthUrl;
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<{ok: boolean, accessToken: string, refreshToken: string, user: object}>}
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/password/reset", { email });
    return response.data;
  },

  /**
   * Confirm password reset with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  confirmPasswordReset: async (token, newPassword) => {
    const response = await api.post("/auth/password/reset/confirm", { token, newPassword });
    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{ok: boolean, accessToken: string}>}
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise<{ok: boolean, user: object}>}
   */
  updateProfile: async (profileData) => {
    const response = await api.put("/auth/me", profileData);
    return response.data;
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post("/auth/me/password/change", { currentPassword, newPassword });
    return response.data;
  },

  /**
   * Setup 2FA
   * @returns {Promise<{ok: boolean, qrCode: string, secret: string}>}
   */
  setup2FA: async () => {
    const response = await api.post("/auth/me/2fa/setup");
    return response.data;
  },

  /**
   * Verify 2FA setup
   * @param {string} token - 2FA token
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  verify2FASetup: async (token) => {
    const response = await api.post("/auth/me/2fa/verify", { token });
    return response.data;
  },

  /**
   * Disable 2FA
   * @param {string} token - 2FA token
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  disable2FA: async (token) => {
    const response = await api.post("/auth/me/2fa/disable", { token });
    return response.data;
  },

  /**
   * Get user sessions
   * @returns {Promise<{ok: boolean, sessions: array}>}
   */
  getSessions: async () => {
    const response = await api.get("/auth/sessions");
    return response.data;
  },

  /**
   * Revoke a session
   * @param {string} sessionId - Session ID to revoke
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  revokeSession: async (sessionId) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};

export default AuthService;
