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
          // DEVELOPER MODE: bypass enabled — nothing is required, components should
          // respect NEXT_PUBLIC_BYPASS_AUTH and handle a failure to fetch session.
          // We do not store tokens in localStorage for security reasons.
        } else {
          // If explicitly disabled, ensure session cleared
          if (localStorage.getItem("DEV_BYPASS_AUTH") === "false") {
            // No-op — the NextAuth session will be used for authentication.
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [dispatch, currentLocale]);

  return null; // This component doesn't render anything
}
