"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  // authSlice stores `accessToken` and some older code uses `token`.
  // Support both so bypasses / mixed states won't break behavior.
  const { user, accessToken, token } = useSelector((state) => state.auth);
  const authToken = accessToken || token;

  // Allow bypass at runtime in development using NEXT_PUBLIC_BYPASS_AUTH env or
  // a local runtime flag (localStorage key DEV_BYPASS_AUTH).
  const getBypassFlag = () => {
    const envFlag = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
    if (envFlag) return true;
    try {
      if (typeof window !== "undefined") {
        const ls = localStorage.getItem("DEV_BYPASS_AUTH");
        return ls === "true";
      }
    } catch (e) {
      // ignore
    }
    return false;
  };
  const BYPASS = getBypassFlag();

  useEffect(() => {
    if (!authToken && !BYPASS) {
      router.push("/auth/login");
      return;
    }

    if (
      !BYPASS &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user?.role)
    ) {
      router.push("/unauthorized");
    }
  }, [token, user, allowedRoles, router]);

  return <>{children}</>;
}
