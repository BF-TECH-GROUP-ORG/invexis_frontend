"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SideBar from "@/components/layouts/SideBar";
import TopNavBar from "@/components/layouts/NavBar";
import DevBypassToggle from "@/components/shared/DevBypassToggle";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "@/lib/ProtectedRoute";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { useLoading } from "@/contexts/LoadingContext";
import useRouteLoading from "@/hooks/useRouteLoading";

export default function LayoutWrapper({ children }) {
  // Use NextAuth session for auth
  const { user, status } = useAuth();
  const { isLoading: globalLoading } = useLoading();
  const { isNavigating } = useRouteLoading();

  // authToken not stored in client-side storage; NextAuth session contains tokens
  // Consider runtime localStorage toggle for bypass (DEV_BYPASS_AUTH) as well
  const getBypass = () => {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") return true;
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("DEV_BYPASS_AUTH") === "true";
      }
    } catch (e) {
      return false;
    }
  };
  const BYPASS = getBypass();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    if (saved !== null) setExpanded(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", String(expanded));
  }, [expanded]);

  const sidebarRem = expanded ? 16 : 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();

  if (!mounted) {
    return <GlobalLoader visible={true} text="Loading..." />;
  }

  // Show loader during navigation or global loading
  const showLoader = globalLoading || isNavigating;

  // If the current route is an error page or not-found, render standalone (no sidebar/navbar)
  // Also exclude auth pages from dashboard layout
  const isErrorPage =
    pathname?.includes("/errors/") || pathname?.endsWith("/not-found");
  const isAuthPage = pathname?.includes("/auth/");

  if (isErrorPage) {
    return (
      <>
        <GlobalLoader visible={showLoader} text="Loading..." />
        {!showLoader && children}
      </>
    );
  }

  // Define public routes that don't require authentication
  const PUBLIC_ROUTES_PATTERNS = [
    /^\/[a-z]{2}\/?$/, // "/" with locale (e.g., /en, /fr)
    /^\/[a-z]{2}\/welcome/, // "/welcome" pages
    /^\/[a-z]{2}\/auth\//, // "/auth/*" pages
    /^\/[a-z]{2}\/errors\//, // "/errors/*" pages
    /^\/[a-z]{2}\/not-found$/, // "/not-found" page
    /^\/[a-z]{2}\/unauthorized$/, // "/unauthorized" page
  ];

  const isPublicRoute = PUBLIC_ROUTES_PATTERNS.some((pattern) =>
    pattern.test(pathname || "")
  );

  // If the current route is the unauthorized page we render it full-screen and hide
  // the app chrome (sidebar/topnav). This keeps the unauthorized page isolated.
  if (pathname?.includes("/unauthorized")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
        <DevBypassToggle />
      </div>
    );
  }

  // In dev you can set NEXT_PUBLIC_BYPASS_AUTH=true to render app without logging in
  const isLoggedIn = BYPASS || Boolean(user);

  // Allow unauthenticated access to public routes (home, welcome, auth pages, etc.)
  if (!isLoggedIn && isPublicRoute) {
    return (
      <>
        <GlobalLoader visible={showLoader} text="Loading..." />
        {!showLoader && (
          <div className="min-h-screen bg-gray-50">
            {children}
            <DevBypassToggle />
          </div>
        )}
      </>
    );
  }

  // For protected routes, if not logged in, ProtectedRoute will handle redirect
  if (!isLoggedIn) {
    return (
      <>
        <GlobalLoader visible={showLoader} text="Loading..." />
        {!showLoader && (
          <div className="min-h-screen bg-gray-50">
            {children}
            <DevBypassToggle />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <GlobalLoader visible={showLoader} text="Loading..." />
      {!showLoader && (
        <DashboardLayout>
          {/* Layout-level protection: only require authenticated session; per-route RBAC enforced in middleware */}
          <ProtectedRoute>
            <div className="flex h-screen">
              <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4">{children}</main>
              </div>
            </div>
          </ProtectedRoute>
          <DevBypassToggle />
        </DashboardLayout>
      )}
    </>
  );
}
