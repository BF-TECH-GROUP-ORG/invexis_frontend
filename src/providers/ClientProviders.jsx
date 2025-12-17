"use client";

import React, { useState } from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "@/store";
import { SocketProvider } from "./SocketProvider";
import { SnackbarProvider } from "@/contexts/SnackbarContext";

const ClientProviders = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <SocketProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </SocketProvider>
        </SessionProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default ClientProviders;
