// src/components/shared/SettingsInitializer.jsx
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  initializeSettings,
  setLocale,
} from "@/features/settings/settingsSlice";
import { setAuthSession, clearAuthSession } from "@/features/auth/authSlice";

/**
 * Component to initialize settings from localStorage
 * and sync with the current locale
 */
export default function SettingsInitializer() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentLocale = useLocale();

  useEffect(() => {
    // Initialize settings from localStorage
    dispatch(initializeSettings());

    // Sync Redux locale with Next-intl locale
    dispatch(setLocale(currentLocale));

    // Setup optional runtime dev auth bypass if present (only on client)
    try {
      if (typeof window !== "undefined") {
        const enabled =
          process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
          localStorage.getItem("DEV_BYPASS_AUTH") === "true";

        if (enabled) {
          // populate a minimal dev session so components relying on user won't crash
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
          // If explicitly disabled, ensure session cleared
          if (localStorage.getItem("DEV_BYPASS_AUTH") === "false") {
            dispatch(clearAuthSession());
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch, currentLocale]);

  return null; // This component doesn't render anything
}
