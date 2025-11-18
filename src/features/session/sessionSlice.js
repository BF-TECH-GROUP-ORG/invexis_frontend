import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
};

// Load from localStorage
const savedSession = typeof window !== "undefined" ? localStorage.getItem("session") : null;
if (savedSession) {
  initialState.session = JSON.parse(savedSession);
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
