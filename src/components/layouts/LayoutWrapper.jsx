"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import SideBar from "@/components/layouts/SideBar";
import TopNavBar from "@/components/layouts/NavBar";
import DevBypassToggle from "@/components/shared/DevBypassToggle";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "@/lib/ProtectedRoute";
import GlobalLoader from "@/components/shared/GlobalLoader";
import { useLoading } from "@/contexts/LoadingContext";
import useRouteLoading from "@/hooks/useRouteLoading";
import useNotifications from "@/hooks/useNotifications";
import TopProgressBar from "@/components/shared/TopProgressBar";

const isDev = process.env.NEXT_PUBLIC_APP_PHASE === "development";

export default function LayoutWrapper({ children }) {
  // Use NextAuth session for auth
  // Use NextAuth session for auth
  const { user, status } = useAuth();
  const { isLoading: globalLoading, loadingText, setLoading } = useLoading();
  const { isNavigating } = useRouteLoading();
  useNotifications();
  const pathname = usePathname();

  // Track previous path to detect transition from Auth -> App
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  const isComingFromAuth = prevPathRef.current?.includes("/auth/");

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
    // 1. Initial State: Sidebar starts OPEN as requested
    setExpanded(true);

    // 2. Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setExpanded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Persist only when it's not the initial mount or if we want to save user's manual changes
    localStorage.setItem("sidebar-expanded", String(expanded));
  }, [expanded]);

  const sidebarRem = expanded ? 16 : 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically dismiss global loader once the navigation is complete
  // This addresses the "stuck loader" after login/logout
  useEffect(() => {
    if (globalLoading) {
      // Add a small delay to ensure the component has mounted before clearing
      const timer = setTimeout(() => {
        setLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, setLoading, globalLoading]);

  // pathname moved to top


  // Hydration safety: render nothing or simple skeleton for initial pass
  // BUT avoid full screen loader if we want it to feel fast
  // We'll just skip the loader and render the layout structure immediately 
  // since most parts are CSR anyway.


  // Show loader during navigation or global loading
  const showLoader = globalLoading || isNavigating;

  // Determine if we are explicitly logging out
  // If so, we want to show the full screen loader, NOT the dashboard layout
  const isLoggingOut = globalLoading && loadingText?.toLowerCase().includes("logging out");

  // If the current route is an auth page, error page, not-found, or unauthorized, render standalone
  const isErrorOrStandalonePage =
    pathname?.includes("/auth/") ||
    pathname?.includes("/errors/") ||
    pathname?.includes("/not-found") ||
    pathname?.includes("/unauthorized");

  if (isErrorOrStandalonePage) {
    return (
      <>
        <GlobalLoader visible={showLoader} text={loadingText || "Loading..."} />
        {!showLoader && (
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            {children}
            {/* <DevBypassToggle /> */}
          </div>
        )}
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

  // In dev you can set NEXT_PUBLIC_BYPASS_AUTH=true to render app without logging in
  const isLoggedIn = BYPASS || Boolean(user);

  // Allow unauthenticated access to public routes (home, welcome, auth pages, etc.)
  if (!isLoggedIn && isPublicRoute) {
    return (
      <>
        <GlobalLoader visible={showLoader} text={loadingText || "Loading..."} />
        {!showLoader && (
          <div className="min-h-screen bg-white">
            {children}
            {isDev && <DevBypassToggle />}
          </div>
        )}
      </>
    );
  }

  // For protected routes, if not logged in, ProtectedRoute will handle redirect
  if (!isLoggedIn) {
    return (
      <>
        <GlobalLoader visible={showLoader} text={loadingText || "Loading..."} />
        {!showLoader && (
          <div className="min-h-screen bg-white">
            {children}
            {isDev && <DevBypassToggle />}
          </div>
        )}
      </>
    );
  }

  // prevPathRef logic moved to top

  // Clean loader logic:
  // 1. Initial Mount or Auth Loading -> Full Screen
  // 2. Global Loading (Logout/Login actions) -> Full Screen
  // 3. Navigation FROM Auth pages -> Full Screen (prevents transition to inner loader)
  // 4. Other Navigation -> Top Progress Bar (Partial/Progressive)

  const showFullScreenLoader = globalLoading || (isNavigating && isComingFromAuth);
  const showTopProgress = isNavigating && !isComingFromAuth;

  // If logged in but on auth page (redirecting), show Full Screen
  // const isAuthRoute = /^\/[a-z]{2}\/auth\//.test(pathname || "");
  // if (isLoggedIn && isAuthRoute) {
  //   return <GlobalLoader visible={true} text="Loading..." />;
  // }

  return (
    <>
      <TopProgressBar isNavigating={showTopProgress} />
      {showFullScreenLoader ? (
        <GlobalLoader visible={true} text={loadingText || "Loading..."} />
      ) : (
        <DashboardLayout expanded={expanded} setExpanded={setExpanded}>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
          {isDev && <DevBypassToggle />}
        </DashboardLayout>
      )}
    </>
  );
}
