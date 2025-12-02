"use client";

import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import SideBar from "@/components/layouts/SideBar";
import TopNavBar from "@/components/layouts/NavBar";
import DevBypassToggle from "@/components/shared/DevBypassToggle";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "@/lib/ProtectedRoute";

export default function LayoutWrapper({ children }) {
  // Use NextAuth session for auth
  const { user, status } = useAuth();
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

  if (!mounted) {
    return null;
  }

  // In dev you can set NEXT_PUBLIC_BYPASS_AUTH=true to render app without logging in
  const isLoggedIn = BYPASS || Boolean(user);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <DevBypassToggle />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <ProtectedRoute allowedRoles={["admin", "worker", "manager"]}>
        <div className="flex h-screen">
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-4">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
      <DevBypassToggle />
    </DashboardLayout>
  );
}
