import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

// Load user from localStorage when app starts (but not tokens)
if (typeof window !== "undefined") {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      initialState.user = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error("Failed to load user from local storage", e);
  }
}

// Development bypass
if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
  initialState.user = {
    id: "dev",
    name: "Dev User",
    email: "dev@local",
    role: "admin",
  };
  initialState.accessToken = "__dev_bypass_token__";
  initialState.isAuthenticated = true;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      // Persist user only
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    clearAuthSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    },
  },
});

export const {
  setAuthSession,
  updateUser,
  updateAccessToken,
  clearAuthSession,
} = authSlice.actions;
export default authSlice.reducer;
