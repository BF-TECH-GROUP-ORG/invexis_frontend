/**
 * Authentication Utilities
 * Handles token storage and retrieval from localStorage
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

/**
 * Get access token from localStorage
 * @returns {string|null}
 */
export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get user data from localStorage
 * @returns {object|null}
 */
export const getUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set access token in localStorage
 * @param {string} token
 */
export const setAccessToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Set refresh token in localStorage
 * @param {string} token
 */
export const setRefreshToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
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
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  setUser(user);
};

/**
 * Remove all tokens and user data from localStorage
 */
export const removeTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};
