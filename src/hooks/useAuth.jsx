// Hook: get current authenticated user and helper data from Redux store
import { useSession } from "next-auth/react";

export default function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const isAuthenticated = status === "authenticated";
  return { user, isAuthenticated, status };
}
