"use client";

import { useSession } from "next-auth/react";

export default function AuthProvider({ children }) {
  const { status } = useSession();

  // Keep a simple wrapper — SessionProvider is added at the client providers level.
  // We allow children to render while session is loading; components should guard if needed.
  return <>{children}</>;
}
