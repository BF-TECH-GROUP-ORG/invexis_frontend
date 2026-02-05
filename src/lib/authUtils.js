/**
 * Authentication Utilities
 * Handles token storage and retrieval from localStorage
 */

// Tokens are now handled by NextAuth — don't store them in localStorage.
const ACCESS_TOKEN_KEY = "accessToken"; // kept for backward compat but not used
const REFRESH_TOKEN_KEY = "refreshToken"; // kept for backward compat but not used
const USER_KEY = "user";

/**
 * Get access token from localStorage
 * @returns {string|null}
 */
export const getAccessToken = () => {
  // DEPRECATED: NextAuth stores tokens in session cookies/JWTs. Use next-auth getSession / useSession.
  return null;
};

/**
 * Get refresh token from localStorage
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  // DEPRECATED: refresh tokens are HttpOnly cookies managed by the backend/NextAuth.
  return null;
};

/**
 * Get user data from localStorage
 * @returns {object|null}
 */
export const getUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};

/**
 * Set access token in localStorage
 * @param {string} token
 */
export const setAccessToken = (token) => {
  // NO-OP: do not store access tokens in localStorage; NextAuth manages tokens.
};

/**
 * Set refresh token in localStorage
 * @param {string} token
 */
export const setRefreshToken = (token) => {
  // NO-OP: do not store refresh tokens in localStorage; backend should set HttpOnly cookies.
};

/**
 * Set user data in localStorage
 * @param {object} user
 */
export const setUser = (user) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Set all auth data (tokens + user)
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {object} user
 */
export const setAuthData = (accessToken, refreshToken, user) => {
  // NO-OP for tokens — we only keep user in local storage if needed
  setUser(user);
};

/**
 * Remove all tokens and user data from localStorage
 */
export const removeTokens = () => {
  if (typeof window === "undefined") return;
  // Do not remove tokens here — NextAuth controls session cookies; remove user only
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  // Use next-auth useSession / getSession in the app instead of this helper.
  return false;
};
