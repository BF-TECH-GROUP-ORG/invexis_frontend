"use client";

import { setAuthSession, clearAuthSession, updateUser } from "@/features/auth/authSlice";
import { setSession, clearSession } from "@/features/session/sessionSlice";
import AuthService from "@/services/AuthService";

/**
 * Login user with email and password
 */
export const loginUser = (identifier, password) => async (dispatch) => {
  try {
    const response = await AuthService.login(identifier, password);
    
    if (!response.ok) {
      throw new Error(response.message || "Login failed");
    }

    const { accessToken, refreshToken, user } = response;

    // Set auth session in Redux
    dispatch(setAuthSession({ user, accessToken, refreshToken }));

    // Optionally set session data if available
    if (response.session) {
      dispatch(setSession(response.session));
    }

    return response;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

/**
 * Login with OTP
 */
export const loginWithOTP = (identifier, otp) => async (dispatch) => {
  try {
    const response = await AuthService.verifyOtpLogin(identifier, otp);
    
    if (!response.ok) {
      throw new Error(response.message || "OTP verification failed");
    }

    const { accessToken, refreshToken, user } = response;
    dispatch(setAuthSession({ user, accessToken, refreshToken }));

    return response;
  } catch (err) {
    console.error("OTP login error:", err);
    throw err;
  }
};

/**
 * Request OTP for login
 */
export const requestOTP = (identifier) => async () => {
  try {
    const response = await AuthService.requestOtpLogin(identifier);
    return response;
  } catch (err) {
    console.error("Request OTP error:", err);
    throw err;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => async (dispatch) => {
  try {
    await AuthService.logout();
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Clear auth session regardless of API response
    dispatch(clearAuthSession());
    dispatch(clearSession());
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = (profileData) => async (dispatch) => {
  try {
    const response = await AuthService.updateProfile(profileData);
    
    if (!response.ok) {
      throw new Error(response.message || "Failed to update profile");
    }

    // Update user in Redux
    dispatch(updateUser(response.user));

    return response;
  } catch (err) {
    console.error("Update profile error:", err);
    throw err;
  }
};

/**
 * Update user settings (alias for updateUserProfile for now)
 */
export const updateUserSettings = (settings) => async (dispatch) => {
  return dispatch(updateUserProfile(settings));
};

/**
 * Change password
 */
export const changeUserPassword = (currentPassword, newPassword) => async () => {
  try {
    const response = await AuthService.changePassword(currentPassword, newPassword);
    return response;
  } catch (err) {
    console.error("Change password error:", err);
    throw err;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = (email) => async () => {
  try {
    const response = await AuthService.requestPasswordReset(email);
    return response;
  } catch (err) {
    console.error("Request password reset error:", err);
    throw err;
  }
};

/**
 * Confirm password reset
 */
export const confirmPasswordReset = (token, newPassword) => async () => {
  try {
    const response = await AuthService.confirmPasswordReset(token, newPassword);
    return response;
  } catch (err) {
    console.error("Confirm password reset error:", err);
    throw err;
  }
};

/**
 * Setup 2FA
 */
export const setup2FA = () => async () => {
  try {
    const response = await AuthService.setup2FA();
    return response;
  } catch (err) {
    console.error("Setup 2FA error:", err);
    throw err;
  }
};

/**
 * Verify 2FA setup
 */
export const verify2FASetup = (token) => async () => {
  try {
    const response = await AuthService.verify2FASetup(token);
    return response;
  } catch (err) {
    console.error("Verify 2FA setup error:", err);
    throw err;
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = (token) => async () => {
  try {
    const response = await AuthService.disable2FA(token);
    return response;
  } catch (err) {
    console.error("Disable 2FA error:", err);
    throw err;
  }
};
