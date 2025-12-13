"use client";

import { createContext, useContext, useState } from "react";

const LoadingContext = createContext(undefined);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const setLoading = (value) => {
    setIsLoading(value);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingText,
        setLoadingText,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
