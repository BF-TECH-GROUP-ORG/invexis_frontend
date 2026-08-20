// Hook: get current authenticated user and helper data from NextAuth session
import { useSession } from "next-auth/react";

export default function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const hasError = session?.error === "RefreshAccessTokenError";
  const isAuthenticated = status === "authenticated" && !hasError;
  return { user, isAuthenticated, status, sessionError: session?.error, hasError };
}

