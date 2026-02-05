import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
};

// Load from localStorage
const savedSession = typeof window !== "undefined" ? localStorage.getItem("session") : null;
if (savedSession) {
  try {
    initialState.session = JSON.parse(savedSession);
  } catch (e) {
    console.error("Failed to parse session from localStorage", e);
    localStorage.removeItem("session");
  }
}

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
      localStorage.setItem("session", JSON.stringify(action.payload));
    },
    clearSession: (state) => {
      state.session = null;
      localStorage.removeItem("session");
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
