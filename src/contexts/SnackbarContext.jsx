"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@/components/ui/Snackbar";

const SnackbarContext = createContext({
  showSnackbar: (message, severity) => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // success, error, warning, info

  const showSnackbar = useCallback((msg, serv = "info") => {
    setMessage(msg);
    setSeverity(serv);
    setOpen(true);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </SnackbarContext.Provider>
  );
};
