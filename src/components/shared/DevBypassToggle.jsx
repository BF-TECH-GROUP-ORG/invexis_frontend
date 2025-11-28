"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthSession, clearAuthSession } from "@/features/auth/authSlice";

export default function DevBypassToggle() {
  // Only show in non-production environments
  const enabledInEnv = process.env.NODE_ENV !== "production";
  const [on, setOn] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const runtime =
      typeof window !== "undefined" &&
      localStorage.getItem("DEV_BYPASS_AUTH") === "true";
    const env = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
    const current = env || runtime;
    setOn(Boolean(current));

    if (current) {
      dispatch(
        setAuthSession({
          user: {
            id: "dev",
            name: "Dev User",
            email: "dev@local",
            role: "admin",
          },
          accessToken: "__dev_bypass_token__",
          refreshToken: "__dev_bypass_refresh__",
        })
      );
    }
  }, [dispatch]);

  if (!enabledInEnv) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("DEV_BYPASS_AUTH", String(next));
      }
    } catch (e) {}

    if (next) {
      dispatch(
        setAuthSession({
          user: {
            id: "dev",
            name: "Dev User",
            email: "dev@local",
            role: "admin",
          },
          accessToken: "__dev_bypass_token__",
          refreshToken: "__dev_bypass_refresh__",
        })
      );
    } else {
      dispatch(clearAuthSession());
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-full p-2 text-xs font-medium shadow-lg bg-white/90 border border-gray-200 text-black`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-pressed={on}
          className={`px-3 py-1 rounded-full font-semibold ${
            on ? "bg-green-600 text-white" : "bg-gray-100 text-black"
          }`}
        >
          Auth Bypass: {on ? "ON" : "OFF"}
        </button>
        <span className="text-xs text-gray-600">(dev only)</span>
      </div>
    </div>
  );
}
