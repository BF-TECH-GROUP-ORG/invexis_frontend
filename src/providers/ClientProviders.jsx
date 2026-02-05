"use client";

import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "@/store";
import NotificationProvider from "./NotificationProvider";

// Memoize QueryClient creation to prevent unnecessary re-initialization
// This prevents the QueryClient from being recreated on every render
const createQueryClient = () => {
  return new QueryClient({
    // Aggressive caching defaults for faster query reuse
    defaultOptions: {
      queries: {
        // Reduce network requests by keeping data fresh longer
        staleTime: 60 * 1000, // 1 minute
        // Cache queries aggressively to prevent re-fetches
        gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
        // Retry failed requests once instead of 3 times to fail faster
        retry: 1,
        // Prevent auto-refetching on window focus during dev
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
};

// Create singleton QueryClient instance to reuse across renders
let queryClientInstance = null;

const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
};

const ClientProviders = ({ children }) => {
  // Use memoized QueryClient to prevent recreation
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <Provider store={store}>
      {/* QueryClient with optimized defaults for faster response times */}
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SessionProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ClientProviders;
