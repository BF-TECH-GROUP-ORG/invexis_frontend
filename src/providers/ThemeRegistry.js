"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { selectTheme } from "@/features/settings/settingsSlice"; // Adjust path as needed

// Define palettes separately to avoid circular references
const lightPalette = {
  mode: "light",
  primary: { main: "#ff782d" },
  secondary: { main: "#081422" },
  background: { default: "#ffffff", paper: "#ffffff" }, // Restored to white for light mode clarity
  text: { primary: "#081422", secondary: "#6b7280" },
  divider: "rgba(0, 0, 0, 0.12)",
  grey: { 300: "#d1d5db", 500: "#6b7280" },
};

const darkPalette = {
  mode: "dark",
  primary: { main: "#ff782d" },
  secondary: { main: "#e5e7eb" },
  background: { default: "#0a0a0a", paper: "#1a1a1a" },
  text: { primary: "#e5e7eb", secondary: "#a1a1aa" },
  divider: "rgba(255, 255, 255, 0.12)",
  grey: { 300: "#374151", 500: "#9ca3af" },
};

function getPalette(themeMode) {
  return themeMode === "dark" ? darkPalette : lightPalette;
}

export function ThemeRegistry({ children }) {
  const reduxTheme = useSelector(selectTheme); // Pulls 'light' or 'dark' from Redux
  const currentPalette = getPalette(reduxTheme);

  const theme = createTheme({
    palette: currentPalette,
    typography: {
      fontFamily: '"Metropolis", "Inter", sans-serif',
      fontSize: 14,
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontFamily: "Metropolis, sans-serif",
            textTransform: "none",
            borderRadius: "16px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            color: theme.palette.text.primary,
            "&:hover": {
              transform: "translateY(-1px)",
            },
          }),
          // Target contained variant for primary brand background
          contained: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.mode === "dark" ? "#ffffff" : "#ffffff", // White text for contrast
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 12px rgba(255, 120, 45, 0.3)"
                : "0 2px 8px rgba(255, 120, 45, 0.2)",
            "&:hover": {
              opacity: 0.9,
              backgroundColor:
                theme.palette.primary.dark || `${theme.palette.primary.main}dd`, // Darken on hover
              transform: "translateY(-1px)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 6px 16px rgba(255, 120, 45, 0.4)"
                  : "0 4px 12px rgba(255, 120, 45, 0.3)",
            },
          }),
          // Outlined variant for subtle primary borders
          outlined: ({ theme }) => ({
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor:
                theme.palette.primary.dark || `${theme.palette.primary.main}dd`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.1)"
                  : "rgba(255, 120, 45, 0.05)",
            },
          }),
          // Text variant keeps it light but uses primary for color
          text: ({ theme }) => ({
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.15)"
                  : "rgba(255, 120, 45, 0.08)",
            },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: "16px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            backgroundColor:
              theme.palette.mode === "dark" ? "#1f2937" : "white",
            color: theme.palette.text.primary,
            "& fieldset": {
              borderColor: theme.palette.grey[300],
              borderWidth: 2,
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.3)"
                  : "rgba(255, 120, 45, 0.15)"
              }`,
            },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            color: theme.palette.text.secondary,
            "&.Mui-focused": {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: "20px !important",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 10px 30px rgba(0, 0, 0, 0.4)"
                : "0 10px 30px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255, 120, 45, 0.2)"
                : "rgba(255, 120, 45, 0.15)"
            }`,
            backgroundColor: theme.palette.background.paper,
            overflow: "hidden",
          }),
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            margin: "4px 8px",
            color: theme.palette.text.primary,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.15)"
                  : "rgba(255, 120, 45, 0.08)",
              transform: "translateX(4px)",
            },
            "&.Mui-selected": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.25)"
                  : "rgba(255, 120, 45, 0.15)",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 120, 45, 0.3)"
                    : "rgba(255, 120, 45, 0.2)",
              },
            },
          }),
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: ({ theme }) => ({
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            padding: "10px 14px !important",
            borderRadius: "16px",
            backgroundColor:
              theme.palette.mode === "dark" ? "#374151" : "#fff8f5",
            border: `2px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255, 120, 45, 0.2)"
                : "#ffede0"
            }`,
            color: theme.palette.text.primary,
            "&:focus": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#4b5563" : "#fff8f5",
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${
                theme.palette.mode === "dark"
                  ? "rgba(255, 120, 45, 0.4)"
                  : "rgba(255, 120, 45, 0.2)"
              }`,
            },
          }),
          icon: {
            color: "#ff782d",
            fontSize: "20px",
            right: "10px",
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: {
            "&:before": { display: "none" },
            "&:after": { display: "none" },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            margin: "8px 16px",
            backgroundColor: theme.palette.divider,
          }),
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            minWidth: "36px",
            color: theme.palette.text.primary,
          }),
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
