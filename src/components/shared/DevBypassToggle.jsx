"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function DevBypassToggle() {
  // Only show in non-production environments
  const enabledInEnv = process.env.NODE_ENV !== "production";
  const [on, setOn] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const runtime =
      typeof window !== "undefined" &&
      localStorage.getItem("DEV_BYPASS_AUTH") === "true";
    const env = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
    const current = env || runtime;
    setOn(Boolean(current));

    // Note: previously this function injected a dev auth session into Redux. With NextAuth
    // we no longer store tokens in Redux/localStorage. A runtime bypass flag (localStorage)
    // is sufficient for local development; components/middleware should honour NEXT_PUBLIC_BYPASS_AUTH or DEV_BYPASS_AUTH.
  }, []);

  if (!enabledInEnv) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("DEV_BYPASS_AUTH", String(next));
      }
    } catch (e) {}

    // Nothing else to do here — middleware + components should handle bypass using localStorage
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
