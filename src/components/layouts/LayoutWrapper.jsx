"use client";

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import SideBar from "@/components/layouts/SideBar";
import TopNavBar from "@/components/layouts/NavBar";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "@/lib/ProtectedRoute";

export default function LayoutWrapper({ children }) {
  const { user, token } = useSelector((state) => state.auth);
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

  const isLoggedIn = Boolean(user && token);

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
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
    </DashboardLayout>
  );
}
