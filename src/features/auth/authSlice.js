import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// Load from localStorage when app starts
const savedAuth = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
if (savedAuth) {
  const { user, token } = JSON.parse(savedAuth);
  initialState.user = user;
  initialState.token = token;
  initialState.isAuthenticated = !!token;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthSession: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      localStorage.setItem("auth", JSON.stringify({ user, token }));
    },
    clearAuthSession: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("auth");
    },
  },
});

export const { setAuthSession, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
