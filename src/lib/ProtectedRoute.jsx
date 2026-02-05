"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

export default function ProtectedRoute({ children, allowedRoles = [], allowedDepartments = [] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const authToken = session?.accessToken ?? null;
  const locale = typeof useLocale === "function" ? useLocale() : undefined;

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
    if (status === "loading") return; // wait for session

    if (!authToken && !BYPASS) {
      // Build a localized login path. Prefer the next-intl locale hook when available
      const runtimeLocale = (() => {
        try {
          return locale || null;
        } catch (e) {
          return null;
        }
      })();

      // fallback: parse the pathname to extract first segment as locale
      const fallbackLocale = (() => {
        try {
          const match = window?.location?.pathname?.match(
            /^\/([a-z]{2})(?:\/|$)/i
          );
          return match ? match[1] : "en";
        } catch (e) {
          return "en";
        }
      })();

      const effectiveLocale = runtimeLocale || fallbackLocale;
      const callbackUrl = window?.location?.pathname || "/";
      router.push(
        `/${effectiveLocale}/auth/login?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`
      );
      return;
    }

    if (!BYPASS && (allowedRoles.length > 0 || allowedDepartments.length > 0)) {
      // Compute user role in a compatible way — support `role` or `roles` arrays
      const userRole =
        user?.role || (Array.isArray(user?.roles) && user.roles[0]) || null;
      const userDepartments = user?.assignedDepartments || [];

      // If we don't have a role (session stale/expired), treat that as not authenticated
      if (!userRole) {
        // Redirect to login if role is missing (likely session issue)
        const runtimeLocale = locale || null;
        const fallbackLocale = (() => {
          const match = window?.location?.pathname?.match(
            /^\/([a-z]{2})(?:\/|$)/i
          );
          return match ? match[1] : "en";
        })();
        const effectiveLocale = runtimeLocale || fallbackLocale;
        const callbackUrl = window?.location?.pathname || "/";
        router.push(
          `/${effectiveLocale}/auth/login?callbackUrl=${encodeURIComponent(
            callbackUrl
          )}`
        );
        return;
      }

      const isCompanyAdmin = userRole === "company_admin";
      const hasAllowedRole = allowedRoles.includes(userRole);
      const hasAllowedDepartment = userDepartments.some((dept) =>
        allowedDepartments.includes(dept)
      );

      if (!isCompanyAdmin && !hasAllowedRole && !hasAllowedDepartment) {
        // Redirect to localized unauthorized page
        try {
          const runtimeLocale = locale || null;
          const fallbackLocale = (() => {
            const match = window?.location?.pathname?.match(
              /^\/([a-z]{2})(?:\/|$)/i
            );
            return match ? match[1] : "en";
          })();
          const effective = runtimeLocale || fallbackLocale;
          router.push(`/${effective}/unauthorized`);
        } catch (e) {
          router.push(`/en/unauthorized`);
        }
      }
    }

    // end useEffect
  }, [status, user, authToken, allowedRoles, allowedDepartments, router, locale, BYPASS]);

  return <>{children}</>;
}
