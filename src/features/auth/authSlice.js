import { createSlice } from "@reduxjs/toolkit";
import { setAuthData, removeTokens, getAccessToken, getRefreshToken, getUser } from "@/lib/authUtils";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

// Load from localStorage when app starts
if (typeof window !== "undefined") {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getUser();

  if (accessToken && user) {
    initialState.user = user;
    initialState.accessToken = accessToken;
    initialState.refreshToken = refreshToken;
    initialState.isAuthenticated = true;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      // Persist to localStorage
      setAuthData(accessToken, refreshToken, user);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      // Update token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload);
      }
    },
    clearAuthSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Remove from localStorage
      removeTokens();
    },
  },
});

export const { setAuthSession, updateUser, updateAccessToken, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
