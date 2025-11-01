// src/store/slices/settingsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light", // 'light' or 'dark'
  locale: "en", // 'en', 'fr', 'sw', 'kin'
  isInitialized: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
        // Apply theme to document
        if (action.payload === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    setLocale: (state, action) => {
      state.locale = action.payload;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", action.payload);
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      state.theme = newTheme;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
        // Apply theme to document
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    initializeSettings: (state) => {
      // Load from localStorage
      if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("theme");
        const savedLocale = localStorage.getItem("locale");
        
        if (savedTheme) {
          state.theme = savedTheme;
          // Apply theme to document
          if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        
        if (savedLocale) {
          state.locale = savedLocale;
        }
        
        state.isInitialized = true;
      }
    },
    resetSettings: (state) => {
      state.theme = "light";
      state.locale = "en";
      if (typeof window !== "undefined") {
        localStorage.removeItem("theme");
        localStorage.removeItem("locale");
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const {
  setTheme,
  setLocale,
  toggleTheme,
  initializeSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Selectors
export const selectTheme = (state) => state.settings.theme;
export const selectLocale = (state) => state.settings.locale;
export const selectIsInitialized = (state) => state.settings.isInitialized;
export const selectSettings = (state) => state.settings;