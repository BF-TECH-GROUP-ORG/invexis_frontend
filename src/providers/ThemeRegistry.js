"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#081422",
    },
    secondary: {
      main: "#ff782d",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
          textTransform: "none",
          borderRadius: "12px",
          //   "&:hover": {
          //     backgroundColor: "rgba(8, 20, 34, 0.8)", // hover effect
          //   },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
          borderRadius: "12px",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ff782d",
          },
        },
      },
    },
  },
});

export function ThemeRegistry({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
